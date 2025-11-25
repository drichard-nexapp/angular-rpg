import { computed, inject, Injectable, OnInit, signal } from '@angular/core'
import { CharacterService } from './character.service'
import { Character, type Cooldown } from '../domain/types'
import { actionFightMyNameActionFightPost } from '../../sdk/api'
import { unwrapApiItem } from '../shared/utils'

export interface ActionResult {
  success?: Character
  error?: string
}
abstract class Action {
  abstract do(character: Character): Promise<ActionResult>
}

export class FightAction extends Action {
  async do(character: Character): Promise<ActionResult> {
    try {
      const response = await actionFightMyNameActionFightPost({
        path: { name: character.name },
      })

      const data = unwrapApiItem<{
        characters: Character[]
        cooldown: Cooldown
      }>(response, null)
      if (!data) {
        return { error: 'Invalid response from server' }
      }

      return { success: character }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fight monster'
      return { error: errorMessage }
    }
  }
}

export class Brain {
  private currentStep = 0
  private actions: Action[] = []
  async next(character: Character) {
    if (this.actions[this.currentStep]) {
      const result = await this.actions[this.currentStep].do(character)
      this.currentStep++
    }
    throw new Error('No more actions')
  }
}

@Injectable({
  providedIn: 'root',
})
export class AutomationService implements OnInit {
  charactersService = inject(CharacterService)
  ngOnInit(): void {
    this.charactersService.characters().forEach((c) => {
      this.characterBrains.set({
        ...this.characterBrains(),
        [c.name]: new Brain(),
      })
    })

    this.start()
  }

  private characterBrains = signal<Record<string, Brain>>({})
  private charactersByName = computed(() => {
    return this.charactersService.characters().reduce(
      (acc, val) => {
        return { ...acc, [val.name]: val }
      },
      {} as Record<string, Character>,
    )
  })

  private start() {
    Object.entries(this.characterBrains()).forEach(([c, b]) => {
      void b.next(this.charactersByName()[c])
    })
  }
}
