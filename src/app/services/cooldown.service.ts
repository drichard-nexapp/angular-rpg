import { Injectable, signal, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'
import type { Cooldown, CooldownTracking } from '../domain/types'
import { APP_CONFIG } from '../shared/constants'

@Injectable({
  providedIn: 'root',
})
export class CooldownService implements OnDestroy {
  private cooldowns = signal<Record<string, CooldownTracking>>({})
  private intervals: Record<string, ReturnType<typeof setInterval>> = {}

  private cooldownCompleted$ = new Subject<string>()

  get cooldownCompleted() {
    return this.cooldownCompleted$.asObservable()
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
          const newRemainingSeconds = current.remainingSeconds - 1
          updated[characterName] = {
            ...current,
            remainingSeconds: newRemainingSeconds,
          }
          this.cooldowns.set(updated)

          if (newRemainingSeconds === 0) {
            this.cooldownCompleted$.next(characterName)
            this.clearCooldown(characterName)
          }
        } else {
          this.clearCooldown(characterName)
        }
      }, APP_CONFIG.COOLDOWN.POLL_INTERVAL)
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
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete updated[characterName]
    this.cooldowns.set(updated)

    if (this.intervals[characterName]) {
      clearInterval(this.intervals[characterName])
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

  ngOnDestroy(): void {
    this.clearAllCooldowns()
    this.cooldownCompleted$.complete()
  }
}
