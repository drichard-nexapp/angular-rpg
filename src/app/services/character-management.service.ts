import { inject, Injectable } from '@angular/core'
import { QueryClient } from '@tanstack/angular-query-experimental'
import { ValidatorFn, Validators } from '@angular/forms'
import {
  createCharacterCharactersCreatePost,
  deleteCharacterCharactersDeletePost,
  type CharacterSkin,
} from '../../sdk/api'
import type { Character } from '../domain/types'
import { unwrapApiItem } from '../shared/utils'
import { QUERY_KEYS, APP_CONFIG } from '../shared/constants'
import { extractErrorMessage } from '../shared/types'

export interface Result<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

@Injectable({
  providedIn: 'root',
})
export class CharacterManagementService {
  private queryClient = inject(QueryClient)

  static readonly NAME_CONSTRAINTS = APP_CONFIG.CHARACTER

  static createNameValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(this.NAME_CONSTRAINTS.NAME_MIN_LENGTH),
      Validators.maxLength(this.NAME_CONSTRAINTS.NAME_MAX_LENGTH),
      Validators.pattern(this.NAME_CONSTRAINTS.NAME_PATTERN),
    ]
  }

  async createCharacter(name: string, skin: CharacterSkin): Promise<Result<Character>> {
    try {
      const response = await createCharacterCharactersCreatePost({
        body: {
          name: name.trim(),
          skin,
        },
      })

      const data = unwrapApiItem<Character>(response, null)
      if (data) {
        await this.queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.characters.all(),
        })
        return { success: true, data }
      }

      return { success: false, error: 'Failed to create character' }
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, 'Failed to create character'),
      }
    }
  }

  async deleteCharacter(characterName: string): Promise<Result<void>> {
    try {
      const response = await deleteCharacterCharactersDeletePost({
        body: {
          name: characterName,
        },
      })

      const data = unwrapApiItem(response, null)
      if (data) {
        await this.queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.characters.all(),
        })
        this.queryClient.removeQueries({
          queryKey: QUERY_KEYS.characters.detail(characterName),
        })
        return { success: true }
      }

      return { success: false, error: 'Failed to delete character' }
    } catch (err) {
      return {
        success: false,
        error: extractErrorMessage(err, 'Failed to delete character'),
      }
    }
  }

  validateCharacterName(name: string): ValidationResult {
    const errors: string[] = []
    const { NAME_MIN_LENGTH, NAME_MAX_LENGTH, NAME_PATTERN } = CharacterManagementService.NAME_CONSTRAINTS

    if (!name || name.trim().length === 0) {
      errors.push('Character name is required')
    } else {
      if (name.trim().length < NAME_MIN_LENGTH) {
        errors.push(`Character name must be at least ${NAME_MIN_LENGTH} characters`)
      }
      if (name.trim().length > NAME_MAX_LENGTH) {
        errors.push(`Character name must be at most ${NAME_MAX_LENGTH} characters`)
      }
      if (!NAME_PATTERN.test(name.trim())) {
        errors.push('Character name can only contain letters, numbers, hyphens, and underscores')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
