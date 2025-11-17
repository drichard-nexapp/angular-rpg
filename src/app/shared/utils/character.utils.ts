import type { Character, Cooldown, TilePosition } from '../../domain/types'

export class CharacterUtils {
  static getPosition(character: Character | null): TilePosition | null {
    if (!character) return null
    if (typeof character.x !== 'number' || typeof character.y !== 'number' ||
        isNaN(character.x) || isNaN(character.y)) {
      console.warn('Character has invalid coordinates:', character)
      return null
    }
    return { x: character.x, y: character.y }
  }

  static hasValidPosition(character: Character | null): boolean {
    if (!character) return false
    return (
      typeof character.x === 'number' &&
      typeof character.y === 'number' &&
      !isNaN(character.x) &&
      !isNaN(character.y)
    )
  }
  static isOnCooldown(character: Character | null): boolean {
    if (!character) return false
    return !!(character.cooldown && character.cooldown > 0)
  }

  static getCooldownSeconds(character: Character | null): number {
    if (!character || !character.cooldown) return 0
    return character.cooldown
  }

  static getCooldownExpiration(character: Character | null): string | null {
    if (!character) return null
    return character.cooldown_expiration || null
  }

  static hasRequiredLevel(character: Character | null, requiredLevel: number): boolean {
    if (!character) return false
    return character.level >= requiredLevel
  }

  static hasRequiredSkillLevel(
    character: Character | null,
    skill: keyof Pick<Character, 'mining_level' | 'woodcutting_level' | 'fishing_level' | 'weaponcrafting_level' | 'gearcrafting_level' | 'jewelrycrafting_level' | 'cooking_level'>,
    requiredLevel: number
  ): boolean {
    if (!character) return false
    const skillLevel = character[skill]
    return skillLevel !== undefined && skillLevel >= requiredLevel
  }

  static getHealthPercentage(character: Character | null): number {
    if (!character) return 0
    return character.max_hp > 0 ? (character.hp / character.max_hp) * 100 : 0
  }

  static isAlive(character: Character | null): boolean {
    if (!character) return false
    return character.hp > 0
  }

  static isDead(character: Character | null): boolean {
    return !this.isAlive(character)
  }

  static getGoldFormatted(character: Character | null): string {
    if (!character) return '0'
    return character.gold.toLocaleString()
  }

  static getTotalXp(character: Character | null): number {
    if (!character) return 0
    return (
      (character.mining_xp || 0) +
      (character.woodcutting_xp || 0) +
      (character.fishing_xp || 0) +
      (character.weaponcrafting_xp || 0) +
      (character.gearcrafting_xp || 0) +
      (character.jewelrycrafting_xp || 0) +
      (character.cooking_xp || 0)
    )
  }

  static getCombatLevel(character: Character | null): number {
    if (!character) return 0
    return character.level
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

  static getSkillLevels(character: Character | null): Record<string, number> | null {
    if (!character) return null
    return {
      mining: character.mining_level || 0,
      woodcutting: character.woodcutting_level || 0,
      fishing: character.fishing_level || 0,
      weaponcrafting: character.weaponcrafting_level || 0,
      gearcrafting: character.gearcrafting_level || 0,
      jewelrycrafting: character.jewelrycrafting_level || 0,
      cooking: character.cooking_level || 0,
    }
  }
}
