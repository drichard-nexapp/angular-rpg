import { TestBed } from '@angular/core/testing'
import { QueryClient } from '@tanstack/angular-query-experimental'
import { MapService } from './map.service'

describe('MapService', () => {
  let service: MapService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MapService,
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
    service = TestBed.inject(MapService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should set and get tile position', () => {
    const position = { x: 5, y: 10 }
    service.setTilePosition(position)
    expect(service.getTilePosition()).toEqual(position)
  })

  it('should clear tile position', () => {
    service.setTilePosition({ x: 1, y: 1 })
    service.setTilePosition(null)
    expect(service.getTilePosition()).toBeNull()
  })

  it('should set and get monster code', () => {
    const code = 'chicken'
    service.setMonsterCode(code)
    expect(service.getMonsterCode()).toBe(code)
  })

  it('should clear monster code', () => {
    service.setMonsterCode('chicken')
    service.setMonsterCode(null)
    expect(service.getMonsterCode()).toBeNull()
  })

  it('should set and get resource code', () => {
    const code = 'copper_ore'
    service.setResourceCode(code)
    expect(service.getResourceCode()).toBe(code)
  })

  it('should clear resource code', () => {
    service.setResourceCode('copper_ore')
    service.setResourceCode(null)
    expect(service.getResourceCode()).toBeNull()
  })

  it('should set and get NPC code', () => {
    const code = 'blacksmith'
    service.setNpcCode(code)
    expect(service.getNpcCode()).toBe(code)
  })

  it('should clear NPC code', () => {
    service.setNpcCode('blacksmith')
    service.setNpcCode(null)
    expect(service.getNpcCode()).toBeNull()
  })

  it('should clear all state', () => {
    service.setTilePosition({ x: 1, y: 1 })
    service.setMonsterCode('chicken')
    service.setResourceCode('copper_ore')
    service.setNpcCode('blacksmith')

    service.clearAll()

    expect(service.getTilePosition()).toBeNull()
    expect(service.getMonsterCode()).toBeNull()
    expect(service.getResourceCode()).toBeNull()
    expect(service.getNpcCode()).toBeNull()
  })
})
