import { TestBed } from '@angular/core/testing'
import {
  QueryClient,
  provideTanStackQuery,
} from '@tanstack/angular-query-experimental'
import { CharacterManagementService } from './character-management.service'

describe('CharacterManagementService', () => {
  let service: CharacterManagementService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CharacterManagementService,
        provideTanStackQuery(new QueryClient()),
      ],
    })
    service = TestBed.inject(CharacterManagementService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('validateCharacterName', () => {
    it('should validate a correct character name', () => {
      const result = service.validateCharacterName('TestChar')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty names', () => {
      const result = service.validateCharacterName('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Character name is required')
    })

    it('should reject names shorter than 3 characters', () => {
      const result = service.validateCharacterName('ab')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Character name must be at least 3 characters',
      )
    })

    it('should reject names longer than 12 characters', () => {
      const result = service.validateCharacterName('abcdefghijklm')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Character name must be at most 12 characters',
      )
    })

    it('should reject names with invalid characters', () => {
      const result = service.validateCharacterName('test@char')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Character name can only contain letters, numbers, hyphens, and underscores',
      )
    })

    it('should accept names with letters, numbers, hyphens, and underscores', () => {
      expect(service.validateCharacterName('Test123').valid).toBe(true)
      expect(service.validateCharacterName('Test-Char').valid).toBe(true)
      expect(service.validateCharacterName('Test_Char').valid).toBe(true)
      expect(service.validateCharacterName('Test-123_X').valid).toBe(true)
    })
  })

  describe('createCharacter', () => {
    xit('should create a character successfully', async () => {
      pending('Mocking auto-generated SDK functions requires refactoring')
    })

    xit('should handle API errors', async () => {
      pending('Mocking auto-generated SDK functions requires refactoring')
    })

    xit('should trim character names', async () => {
      pending('Mocking auto-generated SDK functions requires refactoring')
    })
  })

  describe('deleteCharacter', () => {
    xit('should delete a character successfully', async () => {
      pending('Mocking auto-generated SDK functions requires refactoring')
    })

    xit('should handle delete errors', async () => {
      pending('Mocking auto-generated SDK functions requires refactoring')
    })
  })
})
