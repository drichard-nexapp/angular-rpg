import { Component, inject, signal } from '@angular/core'
import { CharacterService } from '../../../services/character.service'
import { CooldownService } from '../../../services/cooldown.service'
import { LoggerService } from '../../../services/logger.service'
import type { Character as CharacterSchema, CooldownTracking } from '../../../domain/types'
import { CharacterUtils } from '../../../shared/utils'
import { MapService } from '../../../services/map.service'
import { ActionService } from '../../../services/action.service'
import { Equipment } from '../equipment/equipment'
import { Inventory } from '../inventory/inventory'
import { Skill } from '../skill/skill'

export enum CharacterMenu {
  None = 'None',
  Inventory = 'Inventory',
  Skills = 'Skills',
  Equipment = 'Equipment',
}

@Component({
  selector: 'app-character',
  templateUrl: './character.html',
  styleUrl: './character.scss',
  imports: [Equipment, Inventory, Skill],
})
export class Character {
  private characterService = inject(CharacterService)
  private cooldownService = inject(CooldownService)
  private logger = inject(LoggerService)
  public actionService = inject(ActionService)
  protected mapService = inject(MapService)

  readonly CharacterMenu = CharacterMenu
  openMenu = signal<CharacterMenu>(CharacterMenu.None)
  selectedCharacter = this.characterService.getSelectedCharacterSignal()
  characters = this.characterService.getCharactersSignal()

  isSelected(character: CharacterSchema): boolean {
    return this.selectedCharacter() === character
  }

  isCharacterOnCooldown(character: CharacterSchema): boolean {
    return this.cooldownService.isOnCooldown(character.name)
  }

  getCharacterCooldown(characterName: string): CooldownTracking | null {
    return this.cooldownService.getCooldown(characterName)
  }

  isCharacterHpFull(character: CharacterSchema): boolean {
    return character.hp >= character.max_hp
  }

  toggleMenu(menu: CharacterMenu): void {
    this.openMenu.set(this.openMenu() === menu ? CharacterMenu.None : menu)
  }

  selectCharacter(character: CharacterSchema): void {
    if (this.selectedCharacter() === character) {
      this.characterService.selectCharacter(null)
      this.mapService.clearAll()
    } else {
      this.characterService.selectCharacter(character)

      const position = CharacterUtils.getPosition(character)
      if (position) {
        this.mapService.setTilePosition(position)
      } else {
        this.logger.error('Character has invalid coordinates', 'GUI', {
          character,
        })
      }

      this.mapService.setResourceCode(null)
      this.mapService.setNpcCode(null)
    }
  }
}
