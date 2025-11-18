import { Injectable, inject, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { CooldownService } from './cooldown.service'
import { ActionQueueService } from './action-queue.service'
import { ActionService } from './action.service'
import { CharacterService } from './character.service'
import { ErrorHandlerService } from './error-handler.service'
import { LoggerService } from './logger.service'
import type { QueuedAction, FightAction, GatherAction, RestAction, CraftAction, MoveAction } from '../domain/action-queue.types'

@Injectable({
  providedIn: 'root',
})
export class ActionExecutorService implements OnDestroy {
  private cooldownService = inject(CooldownService)
  private queueService = inject(ActionQueueService)
  private actionService = inject(ActionService)
  private characterService = inject(CharacterService)
  private errorHandler = inject(ErrorHandlerService)
  private logger = inject(LoggerService)

  private subscription?: Subscription

  initialize(): void {
    this.subscription = this.cooldownService.cooldownCompleted.subscribe((characterName) => {
      this.logger.info(`Cooldown completed for ${characterName}`, 'ActionExecutor')
      this.executeNextAction(characterName)
    })
    this.logger.info('ActionExecutor initialized', 'ActionExecutor')
  }

  private async executeNextAction(characterName: string): Promise<void> {
    if (this.queueService.isExecuting(characterName)) {
      this.logger.warn(`Already executing action for ${characterName}`, 'ActionExecutor')
      return
    }

    const nextAction = this.queueService.peek(characterName)
    if (!nextAction) {
      this.logger.info(`No queued actions for ${characterName}`, 'ActionExecutor')
      return
    }

    this.logger.info(`Executing queued action for ${characterName}: ${nextAction.type}`, 'ActionExecutor')
    this.queueService.setExecuting(characterName, true)

    this.dequeue(characterName)

    const currentCharacter = this.characterService.getSelectedCharacter()
    const isSelectedCharacter = currentCharacter?.name === characterName

    if (!isSelectedCharacter) {
      this.characterService.selectCharacter(
        this.characterService['charactersData']().find(c => c.name === characterName) || null
      )
    }

    try {
      const result = await this.executeAction(nextAction)

      if (result.success) {
        this.errorHandler.handleSuccess(`${nextAction.label} completed`, 'Auto-Execute')
        this.logger.info(`Action executed successfully: ${nextAction.type}`, 'ActionExecutor')
      } else {
        this.errorHandler.handleError(
          result.error || 'Action failed',
          `Auto-Execute: ${nextAction.label}`
        )
        this.queueService.setError(characterName, result.error || 'Action failed')
        this.logger.error(`Action failed: ${nextAction.type} - ${result.error}`, 'ActionExecutor')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.errorHandler.handleError(errorMessage, `Auto-Execute: ${nextAction.label}`)
      this.queueService.setError(characterName, errorMessage)
      this.logger.error(`Action execution error: ${errorMessage}`, 'ActionExecutor', error)
    } finally {
      this.queueService.setExecuting(characterName, false)

      if (!isSelectedCharacter && currentCharacter) {
        this.characterService.selectCharacter(currentCharacter)
      }
    }
  }

  private dequeue(characterName: string): void {
    this.queueService.dequeue(characterName)
  }

  private async executeAction(action: QueuedAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'fight':
        return this.executeFight(action as FightAction)
      case 'gather':
        return this.executeGather(action as GatherAction)
      case 'rest':
        return this.executeRest(action as RestAction)
      case 'craft':
        return this.executeCraft(action as CraftAction)
      case 'move':
        return this.executeMove(action as MoveAction)
      default:
        return { success: false, error: `Unknown action type: ${action.type}` }
    }
  }

  private async executeFight(_action: FightAction): Promise<{ success: boolean; error?: string }> {
    return this.actionService.fightMonster()
  }

  private async executeGather(_action: GatherAction): Promise<{ success: boolean; error?: string }> {
    return this.actionService.gatherResource()
  }

  private async executeRest(_action: RestAction): Promise<{ success: boolean; error?: string }> {
    return this.actionService.restCharacter()
  }

  private async executeCraft(action: CraftAction): Promise<{ success: boolean; error?: string }> {
    const params = action.params as { itemCode: string; quantity: number }
    return this.actionService.craftItem(params.itemCode, params.quantity)
  }

  private async executeMove(action: MoveAction): Promise<{ success: boolean; error?: string }> {
    const params = action.params
    try {
      await this.characterService.moveCharacter(params.x, params.y)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move character',
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
    this.logger.info('ActionExecutor destroyed', 'ActionExecutor')
  }
}
