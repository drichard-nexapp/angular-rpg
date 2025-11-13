import { TestBed } from '@angular/core/testing'
import { NpcService } from './npc.service'
import { CharacterService } from './character.service'
import { CooldownService } from './cooldown.service'
import { ErrorHandlerService } from './error-handler.service'
import type { Character } from '../domain/types'

describe('NpcService', () => {
  let service: NpcService
  let characterService: jasmine.SpyObj<CharacterService>
  let cooldownService: jasmine.SpyObj<CooldownService>
  let errorHandler: jasmine.SpyObj<ErrorHandlerService>

  const mockCharacter = {
    name: 'TestHero',
    level: 10,
    hp: 100,
    max_hp: 100,
  } as any as Character

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
        NpcService,
        { provide: CharacterService, useValue: characterServiceSpy },
        { provide: CooldownService, useValue: cooldownServiceSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy },
      ],
    })

    service = TestBed.inject(NpcService)
    characterService = TestBed.inject(CharacterService) as jasmine.SpyObj<CharacterService>
    cooldownService = TestBed.inject(CooldownService) as jasmine.SpyObj<CooldownService>
    errorHandler = TestBed.inject(ErrorHandlerService) as jasmine.SpyObj<ErrorHandlerService>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('buyItemFromNpc', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.buyItemFromNpc('iron_sword', 1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.buyItemFromNpc('iron_sword', 1)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })
  })

  describe('sellItemToNpc', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.sellItemToNpc('iron_ore', 5)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.sellItemToNpc('iron_ore', 5)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })
  })

  describe('acceptTaskFromNpc', () => {
    it('should return error if no character selected', async () => {
      characterService.getSelectedCharacter.and.returnValue(null)

      const result = await service.acceptTaskFromNpc()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No character selected')
    })

    it('should return error if character is on cooldown', async () => {
      characterService.getSelectedCharacter.and.returnValue(mockCharacter)
      cooldownService.isOnCooldown.and.returnValue(true)

      const result = await service.acceptTaskFromNpc()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Character is on cooldown')
    })
  })
})
