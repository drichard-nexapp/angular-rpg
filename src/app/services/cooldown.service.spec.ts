import { TestBed } from '@angular/core/testing'
import { CooldownService } from './cooldown.service'
import type { Cooldown } from '../domain/types'

describe('CooldownService', () => {
  let service: CooldownService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(CooldownService)
  })

  afterEach(() => {
    service.clearAllCooldowns()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should set and get cooldown', () => {
    const cooldown: Cooldown = {
      total_seconds: 10,
      remaining_seconds: 10,
      started_at: new Date().toISOString(),
      expiration: new Date().toISOString(),
      reason: 'movement',
    }

    service.setCooldown('testCharacter', cooldown)
    const retrieved = service.getCooldown('testCharacter')

    expect(retrieved).toBeTruthy()
    expect(retrieved?.remainingSeconds).toBe(10)
  })

  it('should check if character is on cooldown', () => {
    const cooldown: Cooldown = {
      total_seconds: 10,
      remaining_seconds: 10,
      started_at: new Date().toISOString(),
      expiration: new Date().toISOString(),
      reason: 'movement',
    }

    service.setCooldown('testCharacter', cooldown)
    expect(service.isOnCooldown('testCharacter')).toBe(true)
  })

  it('should return false for character not on cooldown', () => {
    expect(service.isOnCooldown('nonExistentCharacter')).toBe(false)
  })

  it('should get remaining seconds', () => {
    const cooldown: Cooldown = {
      total_seconds: 10,
      remaining_seconds: 5,
      started_at: new Date().toISOString(),
      expiration: new Date().toISOString(),
      reason: 'movement',
    }

    service.setCooldown('testCharacter', cooldown)
    expect(service.getRemainingSeconds('testCharacter')).toBe(5)
  })

  it('should clear cooldown', () => {
    const cooldown: Cooldown = {
      total_seconds: 10,
      remaining_seconds: 10,
      started_at: new Date().toISOString(),
      expiration: new Date().toISOString(),
      reason: 'movement',
    }

    service.setCooldown('testCharacter', cooldown)
    service.clearCooldown('testCharacter')

    expect(service.getCooldown('testCharacter')).toBeNull()
    expect(service.isOnCooldown('testCharacter')).toBe(false)
  })

  it('should clear all cooldowns', () => {
    const cooldown: Cooldown = {
      total_seconds: 10,
      remaining_seconds: 10,
      started_at: new Date().toISOString(),
      expiration: new Date().toISOString(),
      reason: 'movement',
    }

    service.setCooldown('character1', cooldown)
    service.setCooldown('character2', cooldown)

    service.clearAllCooldowns()

    expect(service.getCooldown('character1')).toBeNull()
    expect(service.getCooldown('character2')).toBeNull()
  })

  it('should countdown cooldown over time', (done) => {
    const cooldown: Cooldown = {
      total_seconds: 3,
      remaining_seconds: 3,
      started_at: new Date().toISOString(),
      expiration: new Date().toISOString(),
      reason: 'movement',
    }

    service.setCooldown('testCharacter', cooldown)

    setTimeout(() => {
      const remaining = service.getRemainingSeconds('testCharacter')
      expect(remaining).toBeLessThan(3)
      expect(remaining).toBeGreaterThanOrEqual(0)
      done()
    }, 1500)
  })
})
