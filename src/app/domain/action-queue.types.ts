export type ActionType = 'fight' | 'gather' | 'move' | 'craft' | 'rest'

export interface QueuedAction {
  id: string
  type: ActionType
  label: string
  params?: unknown
  queuedAt: number
}

export interface ActionQueueState {
  characterName: string
  queue: QueuedAction[]
  isExecuting: boolean
  lastExecutedAt?: number
  lastError?: string
}
