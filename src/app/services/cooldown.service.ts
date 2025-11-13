import { Injectable, signal } from '@angular/core'
import type { Cooldown, CooldownTracking } from '../domain/types'

@Injectable({
  providedIn: 'root',
})
export class CooldownService {
  private cooldowns = signal<Record<string, CooldownTracking>>({})
  private intervals: Record<string, ReturnType<typeof setInterval>> = {}

  getCooldowns() {
    return this.cooldowns
  }

  setCooldown(characterName: string, cooldown: Cooldown): void {
    const cooldownsMap = { ...this.cooldowns() }
    cooldownsMap[characterName] = {
      ...cooldown,
      remainingSeconds: cooldown.remaining_seconds || 0,
    }
    this.cooldowns.set(cooldownsMap)

    if (this.intervals[characterName]) {
      clearInterval(this.intervals[characterName])
    }

    if (cooldownsMap[characterName].remainingSeconds > 0) {
      this.intervals[characterName] = setInterval(() => {
        const current = this.cooldowns()[characterName]
        if (current && current.remainingSeconds > 0) {
          const updated = { ...this.cooldowns() }
          updated[characterName] = {
            ...current,
            remainingSeconds: current.remainingSeconds - 1,
          }
          this.cooldowns.set(updated)
        } else {
          this.clearCooldown(characterName)
        }
      }, 1000)
    }
  }

  getCooldown(characterName: string): CooldownTracking | null {
    return this.cooldowns()[characterName] || null
  }

  isOnCooldown(characterName: string): boolean {
    const cooldown = this.getCooldown(characterName)
    return cooldown !== null && cooldown.remainingSeconds > 0
  }

  getRemainingSeconds(characterName: string): number {
    const cooldown = this.getCooldown(characterName)
    return cooldown?.remainingSeconds || 0
  }

  clearCooldown(characterName: string): void {
    const updated = { ...this.cooldowns() }
    delete updated[characterName]
    this.cooldowns.set(updated)

    if (this.intervals[characterName]) {
      clearInterval(this.intervals[characterName])
      delete this.intervals[characterName]
    }
  }

  clearAllCooldowns(): void {
    Object.keys(this.intervals).forEach((key) => {
      clearInterval(this.intervals[key])
    })
    this.intervals = {}
    this.cooldowns.set({})
  }
}
