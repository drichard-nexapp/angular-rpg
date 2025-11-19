import { TestBed } from '@angular/core/testing'
import { QueryClient } from '@tanstack/angular-query-experimental'
import { CharacterService } from './character.service'

describe('CharacterService', () => {
  let service: CharacterService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CharacterService,
        {
          provide: QueryClient,
          useValue: new QueryClient({
            defaultOptions: {
              queries: {
                retry: false,
              },
            },
          }),
        },
      ],
    })
    service = TestBed.inject(CharacterService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should have null selected character initially', () => {
    expect(service.getSelectedCharacter()).toBeNull()
  })

  it('should select character', () => {
    const mockCharacter = {
      name: 'TestCharacter',
      account: 'test',
      skin: 'men1' as const,
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
    }

    service.selectCharacter(mockCharacter)
    expect(service.getSelectedCharacter()).toEqual(mockCharacter)
  })

  it('should deselect character', () => {
    const mockCharacter = {
      name: 'TestCharacter',
      account: 'test',
      skin: 'men1' as const,
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
    }

    service.selectCharacter(mockCharacter)
    service.selectCharacter(null)
    expect(service.getSelectedCharacter()).toBeNull()
  })

  it('should throw error when trying to move without selected character', async () => {
    await expectAsync(service.moveCharacter(1, 1)).toBeRejectedWithError(
      'No character selected',
    )
  })
})
