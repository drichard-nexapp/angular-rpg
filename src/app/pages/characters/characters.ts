import { Component, computed, signal, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental'
import { getMyCharactersMyCharactersGet, createCharacterCharactersCreatePost, deleteCharacterCharactersDeletePost, type CharacterSkin } from '../../../sdk/api'
import type { Character } from '../../domain/types'
import { unwrapApiResponse } from '../../shared/utils'
import { SkinService } from '../../services/skin.service'

@Component({
  selector: 'app-characters',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters {
  private fb = new FormBuilder()
  skinService = inject(SkinService)

  queryClient = injectQueryClient()
  showCreateForm = signal(false)
  creatingCharacter = signal(false)
  createError = signal<string | null>(null)
  deletingCharacter = signal<string | null>(null)
  deleteError = signal<string | null>(null)

  characterForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(12),
      Validators.pattern(/^[a-zA-Z0-9_-]+$/)
    ]],
    skin: ['men1' as CharacterSkin, [Validators.required]]
  })

  availableSkins: CharacterSkin[] = ['men1', 'men2', 'men3', 'women1', 'women2', 'women3']

  getSkinSymbol(skin: string): string {
    return this.skinService.getSymbol(skin)
  }

  charactersQuery = injectQuery(() => ({
    queryKey: ['my-characters'],
    queryFn: async (): Promise<Character[]> => {
      const response = await getMyCharactersMyCharactersGet()
      return unwrapApiResponse<Character[]>(response, [])
    },
    staleTime: 1000 * 30,
  }))

  characters = computed((): Character[] => this.charactersQuery.data() ?? [])
  loading = computed((): boolean => this.charactersQuery.isPending())
  error = computed((): string | null => {
    const err = this.charactersQuery.error()
    return err ? (err as Error).message : null
  })

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v)
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

    try {
      const formValue = this.characterForm.value
      const response = await createCharacterCharactersCreatePost({
        body: {
          name: formValue.name.trim(),
          skin: formValue.skin,
        },
      })

      if (response && 'data' in response && response.data) {
        await this.charactersQuery.refetch()
        this.showCreateForm.set(false)
        this.characterForm.reset({ name: '', skin: 'men1' })
      }
    } catch (err) {
      const error = err as { error?: { message?: string } }
      this.createError.set(error?.error?.message || 'Failed to create character')
    } finally {
      this.creatingCharacter.set(false)
    }
  }

  get nameControl() {
    return this.characterForm.get('name')
  }

  get skinControl() {
    return this.characterForm.get('skin')
  }

  getNameError(): string | null {
    const control = this.nameControl
    if (!control || !control.touched) return null

    if (control.hasError('required')) {
      return 'Character name is required'
    }
    if (control.hasError('minlength')) {
      return 'Character name must be at least 3 characters'
    }
    if (control.hasError('maxlength')) {
      return 'Character name must be at most 12 characters'
    }
    if (control.hasError('pattern')) {
      return 'Character name can only contain letters, numbers, hyphens, and underscores'
    }
    return null
  }

  async deleteCharacter(characterName: string): Promise<void> {
    const confirmed = confirm(`Are you sure you want to delete "${characterName}"? This action cannot be undone.`)

    if (!confirmed) return

    this.deletingCharacter.set(characterName)
    this.deleteError.set(null)

    try {
      const response = await deleteCharacterCharactersDeletePost({
        body: {
          name: characterName,
        },
      })

      if (response && 'data' in response && response.data) {
        await this.charactersQuery.refetch()
        this.queryClient.removeQueries({ queryKey: ['character', characterName] })
      }
    } catch (err) {
      const error = err as { error?: { message?: string } }
      this.deleteError.set(error?.error?.message || 'Failed to delete character')
    } finally {
      this.deletingCharacter.set(null)
    }
  }

  isDeleting(characterName: string): boolean {
    return this.deletingCharacter() === characterName
  }
}
