import { CharacterUtils } from './character.utils'
import type { Character } from '../../domain/types'

describe('CharacterUtils', () => {
  const createMockCharacter = (overrides: Partial<Character> = {}): Character =>
    ({
      account: 'testaccount',
      name: 'TestCharacter',
      skin: 'men1',
      level: 10,
      xp: 500,
      max_xp: 1000,
      gold: 100,
      speed: 5,
      mining_level: 5,
      mining_xp: 100,
      mining_max_xp: 200,
      woodcutting_level: 3,
      woodcutting_xp: 50,
      woodcutting_max_xp: 100,
      fishing_level: 2,
      fishing_xp: 25,
      fishing_max_xp: 50,
      weaponcrafting_level: 1,
      weaponcrafting_xp: 10,
      weaponcrafting_max_xp: 20,
      gearcrafting_level: 1,
      gearcrafting_xp: 10,
      gearcrafting_max_xp: 20,
      jewelrycrafting_level: 1,
      jewelrycrafting_xp: 10,
      jewelrycrafting_max_xp: 20,
      cooking_level: 1,
      cooking_xp: 10,
      cooking_max_xp: 20,
      hp: 80,
      max_hp: 100,
      haste: 0,
      critical_strike: 5,
      attack_fire: 5,
      attack_earth: 3,
      attack_water: 2,
      attack_air: 1,
      dmg_fire: 4,
      dmg_earth: 3,
      dmg_water: 2,
      dmg_air: 1,
      res_fire: 10,
      res_earth: 10,
      res_water: 10,
      res_air: 10,
      x: 5,
      y: 10,
      cooldown: 0,
      cooldown_expiration: undefined,
      weapon_slot: 'sword',
      shield_slot: 'shield',
      helmet_slot: 'helmet',
      body_armor_slot: 'armor',
      leg_armor_slot: 'pants',
      boots_slot: 'boots',
      ring1_slot: 'ring1',
      ring2_slot: 'ring2',
      amulet_slot: 'amulet',
      artifact1_slot: 'artifact1',
      artifact2_slot: 'artifact2',
      artifact3_slot: 'artifact3',
      consumable1_slot: '',
      consumable1_slot_quantity: 0,
      consumable2_slot: '',
      consumable2_slot_quantity: 0,
      task: '',
      task_type: '',
      task_progress: 0,
      task_total: 0,
      inventory_max_items: 20,
      ...overrides,
    }) as unknown as Character

  describe('getPosition', () => {
    it('should return position for character with valid coordinates', () => {
      const character = createMockCharacter({ x: 5, y: 10 })
      const position = CharacterUtils.getPosition(character)
      expect(position).toEqual({ x: 5, y: 10 })
    })

    it('should return null for null character', () => {
      const position = CharacterUtils.getPosition(null)
      expect(position).toBeNull()
    })

    it('should return null when x is undefined', () => {
      const character = createMockCharacter({
        x: undefined as unknown as number,
        y: 10,
      })
      const position = CharacterUtils.getPosition(character)
      expect(position).toBeNull()
    })

    it('should return null when y is undefined', () => {
      const character = createMockCharacter({
        x: 5,
        y: undefined as unknown as number,
      })
      const position = CharacterUtils.getPosition(character)
      expect(position).toBeNull()
    })

    it('should return null when x is NaN', () => {
      const character = createMockCharacter({ x: NaN, y: 10 })
      const position = CharacterUtils.getPosition(character)
      expect(position).toBeNull()
    })

    it('should return null when y is NaN', () => {
      const character = createMockCharacter({ x: 5, y: NaN })
      const position = CharacterUtils.getPosition(character)
      expect(position).toBeNull()
    })

    it('should return null when x is not a number', () => {
      const character = createMockCharacter({
        x: '5' as unknown as number,
        y: 10,
      })
      const position = CharacterUtils.getPosition(character)
      expect(position).toBeNull()
    })

    it('should return null when y is not a number', () => {
      const character = createMockCharacter({
        x: 5,
        y: '10' as unknown as number,
      })
      const position = CharacterUtils.getPosition(character)
      expect(position).toBeNull()
    })

    it('should accept zero coordinates', () => {
      const character = createMockCharacter({ x: 0, y: 0 })
      const position = CharacterUtils.getPosition(character)
      expect(position).toEqual({ x: 0, y: 0 })
    })

    it('should accept negative coordinates', () => {
      const character = createMockCharacter({ x: -5, y: -10 })
      const position = CharacterUtils.getPosition(character)
      expect(position).toEqual({ x: -5, y: -10 })
    })
  })

  describe('hasValidPosition', () => {
    it('should return true for character with valid coordinates', () => {
      const character = createMockCharacter({ x: 5, y: 10 })
      expect(CharacterUtils.hasValidPosition(character)).toBe(true)
    })

    it('should return false for null character', () => {
      expect(CharacterUtils.hasValidPosition(null)).toBe(false)
    })

    it('should return false when x is undefined', () => {
      const character = createMockCharacter({
        x: undefined as unknown as number,
        y: 10,
      })
      expect(CharacterUtils.hasValidPosition(character)).toBe(false)
    })

    it('should return false when y is undefined', () => {
      const character = createMockCharacter({
        x: 5,
        y: undefined as unknown as number,
      })
      expect(CharacterUtils.hasValidPosition(character)).toBe(false)
    })

    it('should return false when x is NaN', () => {
      const character = createMockCharacter({ x: NaN, y: 10 })
      expect(CharacterUtils.hasValidPosition(character)).toBe(false)
    })

    it('should return false when y is NaN', () => {
      const character = createMockCharacter({ x: 5, y: NaN })
      expect(CharacterUtils.hasValidPosition(character)).toBe(false)
    })

    it('should return false when x is not a number', () => {
      const character = createMockCharacter({
        x: '5' as unknown as number,
        y: 10,
      })
      expect(CharacterUtils.hasValidPosition(character)).toBe(false)
    })

    it('should return false when y is not a number', () => {
      const character = createMockCharacter({
        x: 5,
        y: '10' as unknown as number,
      })
      expect(CharacterUtils.hasValidPosition(character)).toBe(false)
    })

    it('should return true for zero coordinates', () => {
      const character = createMockCharacter({ x: 0, y: 0 })
      expect(CharacterUtils.hasValidPosition(character)).toBe(true)
    })

    it('should return true for negative coordinates', () => {
      const character = createMockCharacter({ x: -5, y: -10 })
      expect(CharacterUtils.hasValidPosition(character)).toBe(true)
    })
  })

  describe('isOnCooldown', () => {
    it('should return true when character has cooldown', () => {
      const character = createMockCharacter({ cooldown: 30 })
      expect(CharacterUtils.isOnCooldown(character)).toBe(true)
    })

    it('should return false when character has no cooldown', () => {
      const character = createMockCharacter({ cooldown: 0 })
      expect(CharacterUtils.isOnCooldown(character)).toBe(false)
    })

    it('should return false for null character', () => {
      expect(CharacterUtils.isOnCooldown(null)).toBe(false)
    })

    it('should return false when cooldown is null', () => {
      const character = createMockCharacter({
        cooldown: null as unknown as number,
      })
      expect(CharacterUtils.isOnCooldown(character)).toBe(false)
    })
  })

  describe('canPerformAction', () => {
    it('should return true when character is alive and not on cooldown', () => {
      const character = createMockCharacter({ hp: 50, cooldown: 0 })
      expect(CharacterUtils.canPerformAction(character)).toBe(true)
    })

    it('should return false when character is on cooldown', () => {
      const character = createMockCharacter({ hp: 50, cooldown: 30 })
      expect(CharacterUtils.canPerformAction(character)).toBe(false)
    })

    it('should return false when character is dead', () => {
      const character = createMockCharacter({ hp: 0, cooldown: 0 })
      expect(CharacterUtils.canPerformAction(character)).toBe(false)
    })

    it('should return false when character is dead and on cooldown', () => {
      const character = createMockCharacter({ hp: 0, cooldown: 30 })
      expect(CharacterUtils.canPerformAction(character)).toBe(false)
    })

    it('should return false for null character', () => {
      expect(CharacterUtils.canPerformAction(null)).toBe(false)
    })
  })

  describe('isAlive', () => {
    it('should return true when character has positive hp', () => {
      const character = createMockCharacter({ hp: 50 })
      expect(CharacterUtils.isAlive(character)).toBe(true)
    })

    it('should return false when character has zero hp', () => {
      const character = createMockCharacter({ hp: 0 })
      expect(CharacterUtils.isAlive(character)).toBe(false)
    })

    it('should return false when character has negative hp', () => {
      const character = createMockCharacter({ hp: -10 })
      expect(CharacterUtils.isAlive(character)).toBe(false)
    })

    it('should return false for null character', () => {
      expect(CharacterUtils.isAlive(null)).toBe(false)
    })
  })

  describe('getHealthPercentage', () => {
    it('should calculate health percentage correctly', () => {
      const character = createMockCharacter({ hp: 50, max_hp: 100 })
      expect(CharacterUtils.getHealthPercentage(character)).toBe(50)
    })

    it('should return 100 when at full health', () => {
      const character = createMockCharacter({ hp: 100, max_hp: 100 })
      expect(CharacterUtils.getHealthPercentage(character)).toBe(100)
    })

    it('should return 0 when at zero health', () => {
      const character = createMockCharacter({ hp: 0, max_hp: 100 })
      expect(CharacterUtils.getHealthPercentage(character)).toBe(0)
    })

    it('should return 0 when max_hp is zero', () => {
      const character = createMockCharacter({ hp: 50, max_hp: 0 })
      expect(CharacterUtils.getHealthPercentage(character)).toBe(0)
    })

    it('should return 0 for null character', () => {
      expect(CharacterUtils.getHealthPercentage(null)).toBe(0)
    })
  })

  describe('formatCooldown', () => {
    it('should format seconds only for values under 60', () => {
      expect(CharacterUtils.formatCooldown(45)).toBe('45s')
    })

    it('should format minutes and seconds', () => {
      expect(CharacterUtils.formatCooldown(90)).toBe('1m 30s')
    })

    it('should format multiple minutes', () => {
      expect(CharacterUtils.formatCooldown(150)).toBe('2m 30s')
    })

    it('should format exact minutes', () => {
      expect(CharacterUtils.formatCooldown(120)).toBe('2m 0s')
    })

    it('should return Ready for zero seconds', () => {
      expect(CharacterUtils.formatCooldown(0)).toBe('Ready')
    })

    it('should return Ready for negative seconds', () => {
      expect(CharacterUtils.formatCooldown(-10)).toBe('Ready')
    })
  })

  describe('hasRequiredLevel', () => {
    it('should return true when character meets level requirement', () => {
      const character = createMockCharacter({ level: 10 })
      expect(CharacterUtils.hasRequiredLevel(character, 10)).toBe(true)
    })

    it('should return true when character exceeds level requirement', () => {
      const character = createMockCharacter({ level: 15 })
      expect(CharacterUtils.hasRequiredLevel(character, 10)).toBe(true)
    })

    it('should return false when character does not meet level requirement', () => {
      const character = createMockCharacter({ level: 5 })
      expect(CharacterUtils.hasRequiredLevel(character, 10)).toBe(false)
    })

    it('should return false for null character', () => {
      expect(CharacterUtils.hasRequiredLevel(null, 10)).toBe(false)
    })
  })

  describe('getCharacterStats', () => {
    it('should return character stats correctly', () => {
      const character = createMockCharacter({
        attack_fire: 5,
        attack_earth: 3,
        attack_water: 2,
        attack_air: 1,
        dmg_fire: 4,
        dmg_earth: 3,
        dmg_water: 2,
        dmg_air: 1,
        hp: 80,
        max_hp: 100,
        level: 10,
      })
      const stats = CharacterUtils.getCharacterStats(character)
      expect(stats).toEqual({
        attack: 11,
        defense: 10,
        hp: 80,
        maxHp: 100,
        level: 10,
      })
    })

    it('should return null for null character', () => {
      expect(CharacterUtils.getCharacterStats(null)).toBeNull()
    })
  })

  describe('getCooldownSeconds', () => {
    it('should return cooldown seconds', () => {
      const character = createMockCharacter({ cooldown: 30 })
      expect(CharacterUtils.getCooldownSeconds(character)).toBe(30)
    })

    it('should return 0 when no cooldown', () => {
      const character = createMockCharacter({ cooldown: 0 })
      expect(CharacterUtils.getCooldownSeconds(character)).toBe(0)
    })

    it('should return 0 for null character', () => {
      expect(CharacterUtils.getCooldownSeconds(null)).toBe(0)
    })
  })
})
