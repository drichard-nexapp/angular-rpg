import { Component, computed, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental'
import { getMyCharactersMyCharactersGet, createCharacterCharactersCreatePost, deleteCharacterCharactersDeletePost, type CharacterSkin } from '../../../sdk/api'
import type { Character } from '../../domain/types'

@Component({
  selector: 'app-characters',
  imports: [RouterLink, FormsModule],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters {
  queryClient = injectQueryClient()
  showCreateForm = signal(false)
  newCharacterName = signal('')
  newCharacterSkin = signal<CharacterSkin>('men1')
  creatingCharacter = signal(false)
  createError = signal<string | null>(null)
  deletingCharacter = signal<string | null>(null)
  deleteError = signal<string | null>(null)

  availableSkins: CharacterSkin[] = ['men1', 'men2', 'men3', 'women1', 'women2', 'women3']

  skinSymbols: Record<CharacterSkin, string> = {
    men1: '🧙‍♂️',
    men2: '⚔️',
    men3: '🛡️',
    women1: '🧙‍♀️',
    women2: '🏹',
    women3: '🗡️',
    corrupted1: '👹',
    zombie1: '🧟',
    marauder1: '🏴‍☠️',
  }

  getSkinSymbol(skin: string): string {
    return this.skinSymbols[skin as CharacterSkin] || '👤'
  }

  charactersQuery = injectQuery(() => ({
    queryKey: ['my-characters'],
    queryFn: async (): Promise<Character[]> => {
      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response && response.data) {
        return (response.data as { data?: Character[] })?.data || []
      }
      return []
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
    this.newCharacterName.set('')
    this.newCharacterSkin.set('men1')
    this.createError.set(null)
  }

  async createCharacter(): Promise<void> {
    const name = this.newCharacterName().trim()

    if (!name) {
      this.createError.set('Character name is required')
      return
    }

    if (name.length < 3 || name.length > 12) {
      this.createError.set('Character name must be between 3 and 12 characters')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      this.createError.set('Character name can only contain letters, numbers, hyphens, and underscores')
      return
    }

    this.creatingCharacter.set(true)
    this.createError.set(null)

    try {
      const response = await createCharacterCharactersCreatePost({
        body: {
          name,
          skin: this.newCharacterSkin(),
        },
      })

      if (response && 'data' in response && response.data) {
        await this.charactersQuery.refetch()
        this.showCreateForm.set(false)
        this.newCharacterName.set('')
        this.newCharacterSkin.set('men1')
      }
    } catch (err) {
      const error = err as { error?: { message?: string } }
      this.createError.set(error?.error?.message || 'Failed to create character')
    } finally {
      this.creatingCharacter.set(false)
    }
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
