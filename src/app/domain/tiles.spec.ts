import { TileFactory } from './tile-factory'
import { MonsterTile } from './monster-tile'
import { ResourceTile } from './resource-tile'
import { NpcTile } from './npc-tile'
import { TerrainTile } from './terrain-tile'

describe('Tile Domain Objects', () => {
  describe('TileFactory', () => {
    it('should create MonsterTile for monster interactions', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest',
        interactions: {
          content: {
            type: 'monster',
            code: 'blue_slime',
          },
        },
      })

      expect(tile).toBeInstanceOf(MonsterTile)
      expect(tile.isMonster()).toBe(true)
      expect(tile.isResource()).toBe(false)
      expect(tile.isNpc()).toBe(false)
    })

    it('should create ResourceTile for resource interactions', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'mountain',
        interactions: {
          content: {
            type: 'resource',
            code: 'iron_ore',
          },
        },
      })

      expect(tile).toBeInstanceOf(ResourceTile)
      expect(tile.isResource()).toBe(true)
      expect(tile.isMonster()).toBe(false)
    })

    it('should create NpcTile for NPC interactions', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest_village',
        interactions: {
          content: {
            type: 'npc',
            code: 'merchant',
          },
        },
      })

      expect(tile).toBeInstanceOf(NpcTile)
      expect(tile.isNpc()).toBe(true)
      expect(tile.isMonster()).toBe(false)
    })

    it('should create TerrainTile for tiles without interactions', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'water',
      })

      expect(tile).toBeInstanceOf(TerrainTile)
      expect(tile.isMonster()).toBe(false)
      expect(tile.isResource()).toBe(false)
      expect(tile.isNpc()).toBe(false)
    })
  })

  describe('MonsterTile', () => {
    it('should expose tile coordinates', () => {
      const tile = TileFactory.createTile({
        x: 5,
        y: 10,
        skin: 'forest',
        interactions: {
          content: {
            type: 'monster',
            code: 'wolf',
          },
        },
      }) as MonsterTile

      expect(tile.x).toBe(5)
      expect(tile.y).toBe(10)
    })

    it('should render with monster emoji', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest',
        interactions: {
          content: {
            type: 'monster',
            code: 'wolf',
          },
        },
      }) as MonsterTile

      const rendered = tile.render()
      expect(rendered.type).toBe('emoji')
      expect(rendered.value).toBe('🐺')
      expect(rendered.cssClass).toBe('monster-emoji')
    })

    it('should return monster code', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest',
        interactions: {
          content: {
            type: 'monster',
            code: 'blue_slime',
          },
        },
      }) as MonsterTile

      expect(tile.getMonsterCode()).toBe('blue_slime')
    })
  })

  describe('ResourceTile', () => {
    it('should identify as resource', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'mountain',
        interactions: {
          content: {
            type: 'resource',
            code: 'iron_ore',
          },
        },
      }) as ResourceTile

      expect(tile.isResource()).toBe(true)
      expect(tile.getInteractionType()).toBe('resource')
    })

    it('should render with resource gem', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'mountain',
        interactions: {
          content: {
            type: 'resource',
            code: 'iron_ore',
          },
        },
      }) as ResourceTile

      const rendered = tile.render()
      expect(rendered.type).toBe('emoji')
      expect(rendered.value).toBe('💎')
      expect(rendered.cssClass).toBe('resource-marker')
    })

    it('should return resource visual marker', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'mountain',
        interactions: {
          content: {
            type: 'resource',
            code: 'iron_ore',
          },
        },
      }) as ResourceTile

      const marker = tile.getVisualMarker()
      expect(marker.type).toBe('resource')
      expect(marker.value).toBe('💎')
    })

    it('should return resource code', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'mountain',
        interactions: {
          content: {
            type: 'resource',
            code: 'iron_ore',
          },
        },
      }) as ResourceTile

      expect(tile.getResourceCode()).toBe('iron_ore')
    })

    it('should determine resource type from code', () => {
      const ironTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'mountain',
        interactions: {
          content: {
            type: 'resource',
            code: 'iron_ore',
          },
        },
      }) as ResourceTile

      expect(ironTile.getResourceType()).toBe('ore')

      const woodTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest',
        interactions: {
          content: {
            type: 'resource',
            code: 'wood_log',
          },
        },
      }) as ResourceTile

      expect(woodTile.getResourceType()).toBe('wood')
    })
  })

  describe('NpcTile', () => {
    it('should identify as NPC', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest_village',
        interactions: {
          content: {
            type: 'npc',
            code: 'merchant',
          },
        },
      }) as NpcTile

      expect(tile.isNpc()).toBe(true)
      expect(tile.getInteractionType()).toBe('npc')
    })

    it('should render with NPC marker', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest_village',
        interactions: {
          content: {
            type: 'npc',
            code: 'merchant',
          },
        },
      }) as NpcTile

      const rendered = tile.render()
      expect(rendered.type).toBe('marker')
      expect(rendered.value).toBe('!')
      expect(rendered.cssClass).toBe('npc-marker')
    })

    it('should return NPC code', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest',
        interactions: {
          content: {
            type: 'npc',
            code: 'merchant',
          },
        },
      }) as NpcTile

      expect(tile.getNpcCode()).toBe('merchant')
    })

    it('should determine NPC type from code', () => {
      const merchantTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'village',
        interactions: {
          content: {
            type: 'npc',
            code: 'merchant',
          },
        },
      }) as NpcTile

      expect(merchantTile.getNpcType()).toBe('merchant')

      const guardTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'village',
        interactions: {
          content: {
            type: 'npc',
            code: 'guard',
          },
        },
      }) as NpcTile

      expect(guardTile.getNpcType()).toBe('guard')
    })
  })

  describe('TerrainTile', () => {
    it('should identify as terrain', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'water',
      }) as TerrainTile

      expect(tile.hasInteraction()).toBe(false)
      expect(tile.isMonster()).toBe(false)
      expect(tile.isResource()).toBe(false)
      expect(tile.isNpc()).toBe(false)
    })

    it('should render with ASCII terrain', () => {
      const tile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'water',
      }) as TerrainTile

      const rendered = tile.render()
      expect(rendered.type).toBe('ascii')
      expect(rendered.value).toBe('~~~')
      expect(rendered.cssClass).toBe('tile-ascii')
    })

    it('should determine terrain type', () => {
      const waterTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'water',
      }) as TerrainTile

      expect(waterTile.getTerrainType()).toBe('water')

      const forestTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest_tree',
      }) as TerrainTile

      expect(forestTile.getTerrainType()).toBe('forest')
    })

    it('should determine if terrain is walkable', () => {
      const waterTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'water',
      }) as TerrainTile

      expect(waterTile.isWalkable()).toBe(false)

      const forestTile = TileFactory.createTile({
        x: 0,
        y: 0,
        skin: 'forest',
      }) as TerrainTile

      expect(forestTile.isWalkable()).toBe(true)
    })
  })
})
