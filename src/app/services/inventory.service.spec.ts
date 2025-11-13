import { TestBed } from '@angular/core/testing'
import { InventoryService } from './inventory.service'
import type { Character, Item } from '../domain/types'

describe('InventoryService', () => {
  let service: InventoryService

  const mockCharacter: Character = {
    name: 'TestCharacter',
    account: 'test',
    skin: 'men1',
    level: 1,
    xp: 0,
    max_xp: 100,
    gold: 100,
    speed: 10,
    mining_level: 1,
    mining_xp: 0,
    mining_max_xp: 100,
    woodcutting_level: 1,
    woodcutting_xp: 0,
    woodcutting_max_xp: 100,
    fishing_level: 1,
    fishing_xp: 0,
    fishing_max_xp: 100,
    weaponcrafting_level: 1,
    weaponcrafting_xp: 0,
    weaponcrafting_max_xp: 100,
    gearcrafting_level: 1,
    gearcrafting_xp: 0,
    gearcrafting_max_xp: 100,
    jewelrycrafting_level: 1,
    jewelrycrafting_xp: 0,
    jewelrycrafting_max_xp: 100,
    cooking_level: 1,
    cooking_xp: 0,
    cooking_max_xp: 100,
    alchemy_level: 1,
    alchemy_xp: 0,
    alchemy_max_xp: 100,
    hp: 100,
    max_hp: 100,
    haste: 0,
    critical_strike: 0,
    wisdom: 0,
    prospecting: 0,
    initiative: 0,
    threat: 0,
    attack_fire: 0,
    attack_earth: 0,
    attack_water: 0,
    attack_air: 0,
    dmg: 0,
    dmg_fire: 0,
    dmg_earth: 0,
    dmg_water: 0,
    dmg_air: 0,
    res_fire: 0,
    res_earth: 0,
    res_water: 0,
    res_air: 0,
    x: 0,
    y: 0,
    layer: 'overworld' as const,
    map_id: 1,
    cooldown: 0,
    cooldown_expiration: undefined,
    weapon_slot: '',
    rune_slot: '',
    shield_slot: '',
    helmet_slot: '',
    body_armor_slot: '',
    leg_armor_slot: '',
    boots_slot: '',
    ring1_slot: '',
    ring2_slot: '',
    amulet_slot: '',
    artifact1_slot: '',
    artifact2_slot: '',
    artifact3_slot: '',
    utility1_slot: '',
    utility1_slot_quantity: 0,
    utility2_slot: '',
    utility2_slot_quantity: 0,
    bag_slot: '',
    task: '',
    task_type: '',
    task_progress: 0,
    task_total: 0,
    inventory_max_items: 20,
    inventory: [
      { slot: 1, code: 'copper_ore', quantity: 10 },
      { slot: 2, code: 'iron_ore', quantity: 5 },
    ],
  }

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(InventoryService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get inventory', () => {
    const inventory = service.getInventory(mockCharacter)
    expect(inventory.length).toBe(2)
    expect(inventory[0].code).toBe('copper_ore')
  })

  it('should return empty inventory for null character', () => {
    const inventory = service.getInventory(null)
    expect(inventory.length).toBe(0)
  })

  it('should get item quantity', () => {
    const quantity = service.getItemQuantity(mockCharacter, 'copper_ore')
    expect(quantity).toBe(10)
  })

  it('should return 0 for non-existent item', () => {
    const quantity = service.getItemQuantity(mockCharacter, 'gold_ore')
    expect(quantity).toBe(0)
  })

  it('should check if has items', () => {
    const requirements = [
      { code: 'copper_ore', quantity: 5 },
      { code: 'iron_ore', quantity: 3 },
    ]
    expect(service.hasItems(mockCharacter, requirements)).toBe(true)
  })

  it('should return false if missing items', () => {
    const requirements = [
      { code: 'copper_ore', quantity: 15 },
      { code: 'iron_ore', quantity: 3 },
    ]
    expect(service.hasItems(mockCharacter, requirements)).toBe(false)
  })

  it('should check if can craft item', () => {
    const item: Item = {
      code: 'test_item',
      name: 'Test Item',
      level: 1,
      type: 'resource',
      subtype: '',
      description: '',
      effects: [],
      tradeable: true,
      craft: {
        skill: 'weaponcrafting',
        level: 1,
        items: [
          { code: 'copper_ore', quantity: 5 },
          { code: 'iron_ore', quantity: 3 },
        ],
        quantity: 1,
      },
    }

    expect(service.canCraftItem(mockCharacter, item)).toBe(true)
  })

  it('should return false if cannot craft item', () => {
    const item: Item = {
      code: 'test_item',
      name: 'Test Item',
      level: 1,
      type: 'resource',
      subtype: '',
      description: '',
      effects: [],
      tradeable: true,
      craft: {
        skill: 'weaponcrafting',
        level: 1,
        items: [
          { code: 'copper_ore', quantity: 15 },
          { code: 'iron_ore', quantity: 3 },
        ],
        quantity: 1,
      },
    }

    expect(service.canCraftItem(mockCharacter, item)).toBe(false)
  })

  it('should get inventory usage', () => {
    const usage = service.getInventoryUsage(mockCharacter)
    expect(usage.used).toBe(2)
    expect(usage.max).toBe(20)
    expect(usage.percentage).toBe(10)
  })

  it('should check if inventory is full', () => {
    expect(service.isInventoryFull(mockCharacter)).toBe(false)

    const fullCharacter = { ...mockCharacter, inventory_max_items: 2 }
    expect(service.isInventoryFull(fullCharacter)).toBe(true)
  })

  it('should check if has inventory space', () => {
    expect(service.hasInventorySpace(mockCharacter, 5)).toBe(true)
    expect(service.hasInventorySpace(mockCharacter, 20)).toBe(false)
  })

  it('should get missing materials', () => {
    const requirements = [
      { code: 'copper_ore', quantity: 15 },
      { code: 'iron_ore', quantity: 3 },
    ]

    const missing = service.getMissingMaterials(mockCharacter, requirements)
    expect(missing.length).toBe(1)
    expect(missing[0].code).toBe('copper_ore')
    expect(missing[0].quantity).toBe(5)
  })

  it('should get available materials', () => {
    const requirements = [
      { code: 'copper_ore', quantity: 15 },
      { code: 'iron_ore', quantity: 3 },
    ]

    const available = service.getAvailableMaterials(mockCharacter, requirements)
    expect(available['copper_ore'].required).toBe(15)
    expect(available['copper_ore'].available).toBe(10)
    expect(available['copper_ore'].missing).toBe(5)
    expect(available['iron_ore'].missing).toBe(0)
  })
})
