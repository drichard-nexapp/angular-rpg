import { Injectable, computed, signal } from '@angular/core'
import type {
  QueuedAction,
  ActionQueueState,
} from '../domain/action-queue.types'
import { LoggerService } from './logger.service'

@Injectable({
  providedIn: 'root',
})
export class ActionQueueService {
  private readonly MAX_QUEUE_SIZE = 10
  private logger = new LoggerService()

  private queues = signal<Map<string, ActionQueueState>>(new Map())

  getQueue(characterName: string): QueuedAction[] {
    return this.queues().get(characterName)?.queue ?? []
  }

  getQueueSignal(characterName: string) {
    return computed(() => this.getQueue(characterName))
  }

  getQueueState(characterName: string): ActionQueueState | null {
    return this.queues().get(characterName) ?? null
  }

  isExecuting(characterName: string): boolean {
    return this.queues().get(characterName)?.isExecuting ?? false
  }

  getQueueLength(characterName: string): number {
    return this.getQueue(characterName).length
  }

  hasQueuedActions(characterName: string): boolean {
    return this.getQueueLength(characterName) > 0
  }

  enqueue(
    characterName: string,
    action: Omit<QueuedAction, 'id' | 'queuedAt'>,
  ): boolean {
    const currentQueue = this.getQueue(characterName)

    if (currentQueue.length >= this.MAX_QUEUE_SIZE) {
      this.logger.warn(`Queue full for ${characterName}`, 'ActionQueueService')
      return false
    }

    const queuedAction: QueuedAction = {
      ...action,
      id: this.generateActionId(),
      queuedAt: Date.now(),
    }

    this.queues.update((queues) => {
      const newQueues = new Map(queues)
      const existingState = newQueues.get(characterName)

      if (existingState) {
        newQueues.set(characterName, {
          ...existingState,
          queue: [...existingState.queue, queuedAction],
        })
      } else {
        newQueues.set(characterName, {
          characterName,
          queue: [queuedAction],
          isExecuting: false,
        })
      }

      return newQueues
    })

    this.logger.info(
      `Action queued for ${characterName}: ${action.type} (${currentQueue.length + 1}/${this.MAX_QUEUE_SIZE})`,
      'ActionQueueService',
    )

    return true
  }

  dequeue(characterName: string): QueuedAction | null {
    const currentQueue = this.getQueue(characterName)

    if (currentQueue.length === 0) {
      return null
    }

    const action = currentQueue[0]

    this.queues.update((queues) => {
      const newQueues = new Map(queues)
      const existingState = newQueues.get(characterName)

      if (existingState) {
        newQueues.set(characterName, {
          ...existingState,
          queue: existingState.queue.slice(1),
        })
      }

      return newQueues
    })

    return action
  }

  peek(characterName: string): QueuedAction | null {
    const queue = this.getQueue(characterName)
    return queue.length > 0 ? queue[0] : null
  }

  remove(characterName: string, actionId: string): boolean {
    const currentQueue = this.getQueue(characterName)
    const actionIndex = currentQueue.findIndex((a) => a.id === actionId)

    if (actionIndex === -1) {
      return false
    }

    this.queues.update((queues) => {
      const newQueues = new Map(queues)
      const existingState = newQueues.get(characterName)

      if (existingState) {
        newQueues.set(characterName, {
          ...existingState,
          queue: existingState.queue.filter((a) => a.id !== actionId),
        })
      }

      return newQueues
    })

    this.logger.info(
      `Removed action ${actionId} from ${characterName} queue`,
      'ActionQueueService',
    )
    return true
  }

  clear(characterName: string): void {
    this.queues.update((queues) => {
      const newQueues = new Map(queues)
      const existingState = newQueues.get(characterName)

      if (existingState) {
        newQueues.set(characterName, {
          ...existingState,
          queue: [],
        })
      }

      return newQueues
    })

    this.logger.info(`Cleared queue for ${characterName}`, 'ActionQueueService')
  }

  clearAll(): void {
    this.queues.set(new Map())
    this.logger.info('Cleared all queues', 'ActionQueueService')
  }

  setExecuting(characterName: string, isExecuting: boolean): void {
    this.queues.update((queues) => {
      const newQueues = new Map(queues)
      const existingState = newQueues.get(characterName)

      if (existingState) {
        newQueues.set(characterName, {
          ...existingState,
          isExecuting,
          lastExecutedAt: isExecuting
            ? Date.now()
            : existingState.lastExecutedAt,
        })
      }

      return newQueues
    })
  }

  setError(characterName: string, error: string): void {
    this.queues.update((queues) => {
      const newQueues = new Map(queues)
      const existingState = newQueues.get(characterName)

      if (existingState) {
        newQueues.set(characterName, {
          ...existingState,
          lastError: error,
          isExecuting: false,
        })
      }

      return newQueues
    })

    this.logger.error(
      `Queue execution error for ${characterName}: ${error}`,
      'ActionQueueService',
    )
  }

  getError(characterName: string): string | null {
    return this.queues().get(characterName)?.lastError ?? null
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  getMaxQueueSize(): number {
    return this.MAX_QUEUE_SIZE
  }
}
