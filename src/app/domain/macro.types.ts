export type ActionType = 'fight' | 'gather' | 'move' | 'craft' | 'rest'

export interface RecordedAction {
  id: string
  type: ActionType
  label: string
  params?: unknown
  recordedAt: number
}

export interface FightAction extends RecordedAction {
  type: 'fight'
}

export interface GatherAction extends RecordedAction {
  type: 'gather'
}

export interface MoveAction extends RecordedAction {
  type: 'move'
  params: {
    x: number
    y: number
  }
}

export interface CraftAction extends RecordedAction {
  type: 'craft'
  params: {
    itemCode: string
    quantity: number
  }
}

export interface RestAction extends RecordedAction {
  type: 'rest'
}

export interface Macro {
  id: string
  name: string
  characterName?: string
  isShared: boolean
  actions: RecordedAction[]
  createdAt: number
  updatedAt: number
}

export interface MacroPlaybackState {
  macroId: string
  characterName: string
  isPlaying: boolean
  isLooping: boolean
  currentActionIndex: number
  loopCount: number
  lastExecutedAt?: number
  lastError?: string
}

export interface MacroRecordingState {
  characterName: string
  isRecording: boolean
  actions: RecordedAction[]
  startedAt: number
}
