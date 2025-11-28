import { SafeCoordinatePipe, SafePositionPipe } from './safe-coordinate.pipe'
import type { Character } from '../../domain/types'

describe('SafeCoordinatePipe', () => {
  let pipe: SafeCoordinatePipe

  beforeEach(() => {
    pipe = new SafeCoordinatePipe()
  })

  const createMockCharacter = (x?: number, y?: number): Character =>
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
      x: x,
      y: y,
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
    }) as unknown as Character

  describe('transform', () => {
    it('should return x coordinate as string for valid character', () => {
      const character = createMockCharacter(5, 10)
      expect(pipe.transform(character, 'x')).toBe('5')
    })

    it('should return y coordinate as string for valid character', () => {
      const character = createMockCharacter(5, 10)
      expect(pipe.transform(character, 'y')).toBe('10')
    })

    it('should return ? for null character', () => {
      expect(pipe.transform(null, 'x')).toBe('?')
      expect(pipe.transform(null, 'y')).toBe('?')
    })

    it('should return ? when x is undefined', () => {
      const character = createMockCharacter(undefined, 10)
      expect(pipe.transform(character, 'x')).toBe('?')
    })

    it('should return ? when y is undefined', () => {
      const character = createMockCharacter(5, undefined)
      expect(pipe.transform(character, 'y')).toBe('?')
    })

    it('should return ? when x is NaN', () => {
      const character = createMockCharacter(NaN, 10)
      expect(pipe.transform(character, 'x')).toBe('?')
    })

    it('should return ? when y is NaN', () => {
      const character = createMockCharacter(5, NaN)
      expect(pipe.transform(character, 'y')).toBe('?')
    })

    it('should handle zero coordinates', () => {
      const character = createMockCharacter(0, 0)
      expect(pipe.transform(character, 'x')).toBe('0')
      expect(pipe.transform(character, 'y')).toBe('0')
    })

    it('should handle negative coordinates', () => {
      const character = createMockCharacter(-5, -10)
      expect(pipe.transform(character, 'x')).toBe('-5')
      expect(pipe.transform(character, 'y')).toBe('-10')
    })

    it('should return ? when coordinate is not a number type', () => {
      const character = createMockCharacter('5' as unknown as number, 10)
      expect(pipe.transform(character, 'x')).toBe('?')
    })
  })
})

describe('SafePositionPipe', () => {
  let pipe: SafePositionPipe

  beforeEach(() => {
    pipe = new SafePositionPipe()
  })

  const createMockCharacter = (x?: number, y?: number): Character =>
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
      x: x,
      y: y,
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
    }) as unknown as Character

  describe('transform', () => {
    it('should return formatted position for valid character', () => {
      const character = createMockCharacter(5, 10)
      expect(pipe.transform(character)).toBe('(5, 10)')
    })

    it('should return (?, ?) for null character', () => {
      expect(pipe.transform(null)).toBe('(?, ?)')
    })

    it('should return (?, ?) when x is undefined', () => {
      const character = createMockCharacter(undefined, 10)
      expect(pipe.transform(character)).toBe('(?, ?)')
    })

    it('should return (?, ?) when y is undefined', () => {
      const character = createMockCharacter(5, undefined)
      expect(pipe.transform(character)).toBe('(?, ?)')
    })

    it('should return (?, ?) when both coordinates are undefined', () => {
      const character = createMockCharacter(undefined, undefined)
      expect(pipe.transform(character)).toBe('(?, ?)')
    })

    it('should return (?, ?) when x is NaN', () => {
      const character = createMockCharacter(NaN, 10)
      expect(pipe.transform(character)).toBe('(?, ?)')
    })

    it('should return (?, ?) when y is NaN', () => {
      const character = createMockCharacter(5, NaN)
      expect(pipe.transform(character)).toBe('(?, ?)')
    })

    it('should handle zero coordinates', () => {
      const character = createMockCharacter(0, 0)
      expect(pipe.transform(character)).toBe('(0, 0)')
    })

    it('should handle negative coordinates', () => {
      const character = createMockCharacter(-5, -10)
      expect(pipe.transform(character)).toBe('(-5, -10)')
    })

    it('should handle mixed positive and negative coordinates', () => {
      const character = createMockCharacter(-5, 10)
      expect(pipe.transform(character)).toBe('(-5, 10)')
    })

    it('should return (?, ?) when coordinates are not number types', () => {
      const character = createMockCharacter('5' as unknown as number, '10' as unknown as number)
      expect(pipe.transform(character)).toBe('(?, ?)')
    })
  })
})
