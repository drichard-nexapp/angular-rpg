import type { Character, TilePosition } from '../../domain/types'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CharacterUtils {
  static getPosition(character: Character | null): TilePosition | null {
    if (!character) return null
    if (isNaN(character.x) ?? isNaN(character.y)) {
      console.warn('Character has invalid coordinates:', character)
      return null
    }
    return { x: character.x, y: character.y }
  }

  static hasValidPosition(character: Character | null): boolean {
    if (!character) return false
    return !isNaN(character.x) && !isNaN(character.y)
  }
  static isOnCooldown(character: Character | null): boolean {
    if (!character) return false
    return !!(character.cooldown && character.cooldown > 0)
  }

  static getCooldownSeconds(character: Character | null): number {
    if (!character?.cooldown) return 0
    return character.cooldown
  }

  static hasRequiredLevel(character: Character | null, requiredLevel: number): boolean {
    if (!character) return false
    return character.level >= requiredLevel
  }

  static getHealthPercentage(character: Character | null): number {
    if (!character) return 0
    return character.max_hp > 0 ? (character.hp / character.max_hp) * 100 : 0
  }

  static isAlive(character: Character | null): boolean {
    if (!character) return false
    return character.hp > 0
  }

  static canPerformAction(character: Character | null): boolean {
    return this.isAlive(character) && !this.isOnCooldown(character)
  }

  static getCharacterStats(character: Character | null): {
    attack: number
    defense: number
    hp: number
    maxHp: number
    level: number
  } | null {
    if (!character) return null
    return {
      attack: character.attack_fire + character.attack_earth + character.attack_water + character.attack_air,
      defense: character.dmg_fire + character.dmg_earth + character.dmg_water + character.dmg_air,
      hp: character.hp,
      maxHp: character.max_hp,
      level: character.level,
    }
  }

  static formatCooldown(seconds: number): string {
    if (seconds <= 0) return 'Ready'

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }
}
