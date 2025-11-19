import { Injectable, inject, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { CooldownService } from './cooldown.service'
import { ActionQueueService } from './action-queue.service'
import { MacroService } from './macro.service'
import { ActionService } from './action.service'
import { CharacterService } from './character.service'
import { ErrorHandlerService } from './error-handler.service'
import { LoggerService } from './logger.service'
import type { QueuedAction } from '../domain/action-queue.types'
import type { RecordedAction } from '../domain/macro.types'

@Injectable({
  providedIn: 'root',
})
export class ActionExecutorService implements OnDestroy {
  private cooldownService = inject(CooldownService)
  private queueService = inject(ActionQueueService)
  private macroService = inject(MacroService)
  private actionService = inject(ActionService)
  private characterService = inject(CharacterService)
  private errorHandler = inject(ErrorHandlerService)
  private logger = inject(LoggerService)

  private subscription?: Subscription

  initialize(): void {
    this.subscription = this.cooldownService.cooldownCompleted.subscribe(
      (characterName) => {
        this.logger.info(
          `Cooldown completed for ${characterName}`,
          'ActionExecutor',
        )
        void this.executeNextAction(characterName)
      },
    )
    this.logger.info('ActionExecutor initialized', 'ActionExecutor')
  }

  triggerExecution(characterName: string): void {
    void this.executeNextAction(characterName)
  }

  private async executeNextAction(characterName: string): Promise<void> {
    if (this.queueService.isExecuting(characterName)) {
      this.logger.warn(
        `Already executing action for ${characterName}`,
        'ActionExecutor',
      )
      return
    }

    let nextAction: QueuedAction | RecordedAction | null
    let isMacroAction = false

    if (this.macroService.isPlaying(characterName)) {
      nextAction = this.macroService.advancePlayback(characterName)
      isMacroAction = true
    } else {
      nextAction = this.queueService.peek(characterName)
    }

    if (!nextAction) {
      this.logger.info(
        `No actions to execute for ${characterName}`,
        'ActionExecutor',
      )
      return
    }

    this.logger.info(
      `Executing ${isMacroAction ? 'macro' : 'queued'} action for ${characterName}: ${nextAction.type}`,
      'ActionExecutor',
    )

    if (isMacroAction) {
      this.macroService.getPlaybackState(characterName)
    } else {
      this.queueService.setExecuting(characterName, true)
      this.dequeue(characterName)
    }

    const currentCharacter = this.characterService.getSelectedCharacter()
    const isSelectedCharacter = currentCharacter?.name === characterName

    if (!isSelectedCharacter) {
      this.characterService.selectCharacter(
        this.characterService['charactersData']().find(
          (c) => c.name === characterName,
        ) || null,
      )
    }

    try {
      const result = await this.executeAction(nextAction)

      if (result.success) {
        const source = isMacroAction ? 'Macro' : 'Auto-Execute'
        this.errorHandler.handleSuccess(`${nextAction.label} completed`, source)
        this.logger.info(
          `Action executed successfully: ${nextAction.type}`,
          'ActionExecutor',
        )
      } else {
        const source = isMacroAction ? 'Macro' : 'Auto-Execute'
        this.errorHandler.handleError(
          result.error || 'Action failed',
          `${source}: ${nextAction.label}`,
        )
        if (isMacroAction) {
          this.macroService.setPlaybackError(
            characterName,
            result.error || 'Action failed',
          )
        } else {
          this.queueService.setError(
            characterName,
            result.error || 'Action failed',
          )
        }
        this.logger.error(
          `Action failed: ${nextAction.type} - ${result.error}`,
          'ActionExecutor',
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      const source = isMacroAction ? 'Macro' : 'Auto-Execute'
      this.errorHandler.handleError(
        errorMessage,
        `${source}: ${nextAction.label}`,
      )
      if (isMacroAction) {
        this.macroService.setPlaybackError(characterName, errorMessage)
      } else {
        this.queueService.setError(characterName, errorMessage)
      }
      this.logger.error(
        `Action execution error: ${errorMessage}`,
        'ActionExecutor',
        error,
      )
    } finally {
      if (!isMacroAction) {
        this.queueService.setExecuting(characterName, false)
      }

      if (!isSelectedCharacter && currentCharacter) {
        this.characterService.selectCharacter(currentCharacter)
      }
    }
  }

  private dequeue(characterName: string): void {
    this.queueService.dequeue(characterName)
  }

  private async executeAction(
    action: QueuedAction | RecordedAction,
  ): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'fight':
        return this.executeFight()
      case 'gather':
        return this.executeGather()
      case 'rest':
        return this.executeRest()
      case 'craft':
        return this.executeCraft(action)
      case 'move':
        return this.executeMove(action)
      default: {
        const unknownAction = action as QueuedAction | RecordedAction
        return {
          success: false,
          error: `Unknown action type: ${unknownAction.type}`,
        }
      }
    }
  }

  private async executeFight(): Promise<{ success: boolean; error?: string }> {
    return this.actionService.fightMonster()
  }

  private async executeGather(): Promise<{ success: boolean; error?: string }> {
    return this.actionService.gatherResource()
  }

  private async executeRest(): Promise<{ success: boolean; error?: string }> {
    return this.actionService.restCharacter()
  }

  private async executeCraft(
    action: QueuedAction | RecordedAction,
  ): Promise<{ success: boolean; error?: string }> {
    const params = action.params as { itemCode: string; quantity: number }
    return this.actionService.craftItem(params.itemCode, params.quantity)
  }

  private async executeMove(
    action: QueuedAction | RecordedAction,
  ): Promise<{ success: boolean; error?: string }> {
    const params = action.params as { x: number; y: number }
    try {
      await this.characterService.moveCharacter(params.x, params.y)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to move character',
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
    this.logger.info('ActionExecutor destroyed', 'ActionExecutor')
  }
}
