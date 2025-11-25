import { Component, computed, signal, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms'
import { injectQuery } from '@tanstack/angular-query-experimental'
import {
  getMyCharactersMyCharactersGet,
  type CharacterSkin,
} from '../../../sdk/api'
import type { Character } from '../../domain/types'
import { unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../../shared/constants'

import { SafePositionPipe } from '../../shared/pipes/safe-coordinate.pipe'
import { getCharacterImageUrl } from '../../shared/asset-urls'
import { CharacterManagementService } from '../../services/character-management.service'
import { ConfirmDialogService } from '../../services/confirm-dialog.service'

@Component({
  selector: 'app-characters',
  imports: [RouterLink, ReactiveFormsModule, SafePositionPipe],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters {
  private characterMgmt = inject(CharacterManagementService)
  private confirmDialog = inject(ConfirmDialogService)

  showCreateForm = signal(false)
  creatingCharacter = signal(false)
  createError = signal<string | null>(null)
  deletingCharacter = signal<string | null>(null)
  deleteError = signal<string | null>(null)

  characterForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: CharacterManagementService.createNameValidators(),
      nonNullable: true,
    }),
    skin: new FormControl<CharacterSkin>('men1', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  })

  availableSkins: CharacterSkin[] = [
    'men1',
    'men2',
    'men3',
    'women1',
    'women2',
    'women3',
  ]

  charactersQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.characters.all(),
    queryFn: async (): Promise<Character[]> => {
      const response = await getMyCharactersMyCharactersGet()
      return unwrapApiResponse<Character[]>(response, [])
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_SHORT,
  }))

  characters = computed((): Character[] => this.charactersQuery.data() ?? [])
  loading = computed((): boolean => this.charactersQuery.isPending())
  error = computed((): string | null => {
    const err = this.charactersQuery.error()
    return err ? (err as Error).message : null
  })

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v)
    this.characterForm.reset({ name: '', skin: 'men1' })
    this.createError.set(null)
  }

  async createCharacter(): Promise<void> {
    if (this.characterForm.invalid) {
      this.characterForm.markAllAsTouched()
      return
    }

    this.creatingCharacter.set(true)
    this.createError.set(null)

    const formValue = this.characterForm.getRawValue()
    const result = await this.characterMgmt.createCharacter(
      formValue.name,
      formValue.skin,
    )

    if (result.success) {
      await this.charactersQuery.refetch()
      this.showCreateForm.set(false)
      this.characterForm.reset({ name: '', skin: 'men1' })
    } else {
      this.createError.set(result.error || 'Failed to create character')
    }

    this.creatingCharacter.set(false)
  }

  get nameControl() {
    return this.characterForm.get('name')
  }

  getNameError(): string | null {
    const control = this.nameControl
    if (!control || !control.touched) return null

    const { NAME_MIN_LENGTH, NAME_MAX_LENGTH } = APP_CONFIG.CHARACTER

    if (control.hasError('required')) {
      return 'Character name is required'
    }
    if (control.hasError('minlength')) {
      return `Character name must be at least ${NAME_MIN_LENGTH} characters`
    }
    if (control.hasError('maxlength')) {
      return `Character name must be at most ${NAME_MAX_LENGTH} characters`
    }
    if (control.hasError('pattern')) {
      return 'Character name can only contain letters, numbers, hyphens, and underscores'
    }
    return null
  }

  async deleteCharacter(characterName: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Character',
      message: `Are you sure you want to delete "${characterName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmDanger: true,
    })

    if (!confirmed) return

    this.deletingCharacter.set(characterName)
    this.deleteError.set(null)

    const result = await this.characterMgmt.deleteCharacter(characterName)

    if (result.success) {
      await this.charactersQuery.refetch()
    } else {
      this.deleteError.set(result.error || 'Failed to delete character')
    }

    this.deletingCharacter.set(null)
  }

  isDeleting(characterName: string): boolean {
    return this.deletingCharacter() === characterName
  }

  getCharacterImage(skin: string) {
    return getCharacterImageUrl(skin)
  }
}
