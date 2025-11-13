import { TestBed } from '@angular/core/testing'
import { ActionService } from './action.service'
import { CharacterService } from './character.service'
import { CooldownService } from './cooldown.service'
import { ErrorHandlerService } from './error-handler.service'
import * as api from '../../sdk/api'
import type { Character, Cooldown } from '../domain/types'

describe('ActionService', () => {
  let service: ActionService
  let characterService: jasmine.SpyObj<CharacterService>
  let cooldownService: jasmine.SpyObj<CooldownService>
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>

  const mockCharacter = {
    name: 'TestHero',
    level: 10,
    hp: 100,
    max_hp: 100,
  } as any as Character

  const mockCooldown: Cooldown = {
    total_seconds: 5,
    remaining_seconds: 5,
    started_at: '2025-11-12T00:00:00Z',
    expiration: '2025-11-12T00:00:05Z',
    reason: 'rest',
  }

  beforeEach(() => {
    const characterServiceSpy = jasmine.createSpyObj('CharacterService', [
      'getSelectedCharacter',
      'updateCharacter',
    ])
    const cooldownServiceSpy = jasmine.createSpyObj('CooldownService', [
      'isOnCooldown',
      'setCooldown',
    ])
    const errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'handleError',
    ])

    TestBed.configureTestingModule({
      providers: [
        ActionService,
        { provide: CharacterService, useValue: characterServiceSpy },
        { provide: CooldownService, useValue: cooldownServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
      ],
    })

    service = TestBed.inject(ActionService)
    characterService = TestBed.inject(CharacterService) as jasmine.SpyObj<CharacterService>
    cooldownService = TestBed.inject(CooldownService) as jasmine.SpyObj<CooldownService>
    errorHandler = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('restCharacter', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.restCharacter()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.restCharacter()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })

  })

  describe('fightMonster', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.fightMonster()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.fightMonster()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })

  })

  describe('gatherResource', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.gatherResource()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.gatherResource()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })

  })

  describe('craftItem', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.craftItem('iron_sword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.craftItem('iron_sword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })

  })
})
