export type ActionType = 'fight' | 'gather' | 'move' | 'craft' | 'rest'

export interface QueuedAction {
  id: string
  type: ActionType
  label: string
  params?: unknown
  queuedAt: number
}

export interface FightAction extends QueuedAction {
  type: 'fight'
}

export interface GatherAction extends QueuedAction {
  type: 'gather'
}

export interface MoveAction extends QueuedAction {
  type: 'move'
  params: {
    x: number
    y: number
  }
}

export interface CraftAction extends QueuedAction {
  type: 'craft'
  params: {
    itemCode: string
    quantity: number
  }
}

export interface RestAction extends QueuedAction {
  type: 'rest'
}

export interface ActionQueueState {
  characterName: string
  queue: QueuedAction[]
  isExecuting: boolean
  lastExecutedAt?: number
  lastError?: string
}
