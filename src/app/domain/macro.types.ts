export type ActionType = 'fight' | 'gather' | 'move' | 'craft' | 'rest'

export interface RecordedAction {
  id: string
  type: ActionType
  label: string
  params?: unknown
  recordedAt: number
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
