import { Injectable, signal } from '@angular/core'
import type { Macro, RecordedAction, MacroRecordingState, MacroPlaybackState } from '../domain/macro.types'
import { LoggerService } from './logger.service'

@Injectable({
  providedIn: 'root',
})
export class MacroService {
  private logger = new LoggerService()

  private macros = signal<Map<string, Macro>>(new Map())
  private recordingStates = signal<Map<string, MacroRecordingState>>(new Map())
  private playbackStates = signal<Map<string, MacroPlaybackState>>(new Map())

  constructor() {
    this.loadMacrosFromStorage()
  }

  getMacros(): Macro[] {
    return Array.from(this.macros().values())
  }

  getMacrosForCharacter(characterName: string): Macro[] {
    return this.getMacros().filter((m) => m.isShared ?? m.characterName === characterName)
  }

  getMacro(macroId: string): Macro | null {
    return this.macros().get(macroId) ?? null
  }

  isRecording(characterName: string): boolean {
    return this.recordingStates().get(characterName)?.isRecording ?? false
  }

  getRecordingState(characterName: string): MacroRecordingState | null {
    return this.recordingStates().get(characterName) ?? null
  }

  getRecordedActions(characterName: string): RecordedAction[] {
    return this.getRecordingState(characterName)?.actions ?? []
  }

  startRecording(characterName: string): void {
    if (this.isRecording(characterName)) {
      this.logger.warn(`Already recording for ${characterName}`, 'MacroService')
      return
    }

    this.recordingStates.update((states) => {
      const newStates = new Map(states)
      newStates.set(characterName, {
        characterName,
        isRecording: true,
        actions: [],
        startedAt: Date.now(),
      })
      return newStates
    })

    this.logger.info(`Started recording for ${characterName}`, 'MacroService')
  }

  recordAction(characterName: string, action: Omit<RecordedAction, 'id' | 'recordedAt'>): boolean {
    if (!this.isRecording(characterName)) {
      this.logger.warn(`Not recording for ${characterName}, cannot record action`, 'MacroService')
      return false
    }

    const recordedAction: RecordedAction = {
      ...action,
      id: this.generateActionId(),
      recordedAt: Date.now(),
    }

    this.recordingStates.update((states) => {
      const newStates = new Map(states)
      const existingState = newStates.get(characterName)

      if (existingState) {
        newStates.set(characterName, {
          ...existingState,
          actions: [...existingState.actions, recordedAction],
        })
      }

      return newStates
    })

    this.logger.info(`Recorded action for ${characterName}: ${action.type}`, 'MacroService')
    return true
  }

  stopRecording(characterName: string, macroName: string, isShared = false): Macro | null {
    const recordingState = this.getRecordingState(characterName)

    if (!recordingState?.isRecording) {
      this.logger.warn(`Not recording for ${characterName}`, 'MacroService')
      return null
    }

    if (recordingState.actions.length === 0) {
      this.logger.warn(`No actions recorded for ${characterName}`, 'MacroService')
      this.cancelRecording(characterName)
      return null
    }

    const macro: Macro = {
      id: this.generateMacroId(),
      name: macroName,
      characterName: isShared ? undefined : characterName,
      isShared,
      actions: recordingState.actions,
      createdAt: recordingState.startedAt,
      updatedAt: Date.now(),
    }

    this.macros.update((macros) => {
      const newMacros = new Map(macros)
      newMacros.set(macro.id, macro)
      return newMacros
    })

    this.recordingStates.update((states) => {
      const newStates = new Map(states)
      newStates.delete(characterName)
      return newStates
    })

    this.saveMacrosToStorage()
    this.logger.info(
      `Saved macro "${macroName}" for ${characterName} with ${macro.actions.length} actions`,
      'MacroService',
    )

    return macro
  }

  cancelRecording(characterName: string): void {
    this.recordingStates.update((states) => {
      const newStates = new Map(states)
      newStates.delete(characterName)
      return newStates
    })

    this.logger.info(`Cancelled recording for ${characterName}`, 'MacroService')
  }

  deleteMacro(macroId: string): boolean {
    const macro = this.getMacro(macroId)
    if (!macro) {
      return false
    }

    this.macros.update((macros) => {
      const newMacros = new Map(macros)
      newMacros.delete(macroId)
      return newMacros
    })

    this.saveMacrosToStorage()
    this.logger.info(`Deleted macro: ${macro.name}`, 'MacroService')
    return true
  }

  isPlaying(characterName: string): boolean {
    return (
      Array.from(this.playbackStates().values()).find(
        (state) => state.characterName === characterName && state.isPlaying,
      ) !== undefined
    )
  }

  getPlaybackState(characterName: string): MacroPlaybackState | null {
    return Array.from(this.playbackStates().values()).find((state) => state.characterName === characterName) ?? null
  }

  startPlayback(macroId: string, characterName: string, loop = false): boolean {
    const macro = this.getMacro(macroId)
    if (!macro) {
      this.logger.error(`Macro not found: ${macroId}`, 'MacroService')
      return false
    }

    if (this.isPlaying(characterName)) {
      this.logger.warn(`Already playing macro for ${characterName}`, 'MacroService')
      return false
    }

    this.playbackStates.update((states) => {
      const newStates = new Map(states)
      newStates.set(macroId, {
        macroId,
        characterName,
        isPlaying: true,
        isLooping: loop,
        currentActionIndex: 0,
        loopCount: 0,
      })
      return newStates
    })

    this.logger.info(`Started playback of macro "${macro.name}" for ${characterName} (loop: ${loop})`, 'MacroService')
    return true
  }

  stopPlayback(characterName: string): void {
    const playbackState = this.getPlaybackState(characterName)
    if (!playbackState) {
      return
    }

    this.playbackStates.update((states) => {
      const newStates = new Map(states)
      newStates.delete(playbackState.macroId)
      return newStates
    })

    this.logger.info(`Stopped playback for ${characterName}`, 'MacroService')
  }

  advancePlayback(characterName: string): RecordedAction | null {
    const playbackState = this.getPlaybackState(characterName)
    if (!playbackState) {
      return null
    }

    const macro = this.getMacro(playbackState.macroId)
    if (!macro) {
      this.stopPlayback(characterName)
      return null
    }

    const action = macro.actions[playbackState.currentActionIndex]

    if (action) {
      this.playbackStates.update((states) => {
        const newStates = new Map(states)
        newStates.set(playbackState.macroId, {
          ...playbackState,
          currentActionIndex: playbackState.currentActionIndex + 1,
          lastExecutedAt: Date.now(),
        })
        return newStates
      })

      return action
    }

    if (playbackState.currentActionIndex >= macro.actions.length) {
      if (playbackState.isLooping) {
        this.playbackStates.update((states) => {
          const newStates = new Map(states)
          newStates.set(playbackState.macroId, {
            ...playbackState,
            currentActionIndex: 0,
            loopCount: playbackState.loopCount + 1,
          })
          return newStates
        })

        this.logger.info(`Looping macro "${macro.name}" (loop ${playbackState.loopCount + 1})`, 'MacroService')
        return macro.actions[0]
      } else {
        this.stopPlayback(characterName)
        this.logger.info(`Completed playback of macro "${macro.name}"`, 'MacroService')
        return null
      }
    }

    return null
  }

  setPlaybackError(characterName: string, error: string): void {
    const playbackState = this.getPlaybackState(characterName)
    if (!playbackState) {
      return
    }

    this.playbackStates.update((states) => {
      const newStates = new Map(states)
      newStates.set(playbackState.macroId, {
        ...playbackState,
        lastError: error,
        isPlaying: false,
      })
      return newStates
    })

    this.logger.error(`Playback error for ${characterName}: ${error}`, 'MacroService')
  }

  getPlaybackError(characterName: string): string | null {
    return this.getPlaybackState(characterName)?.lastError ?? null
  }

  private loadMacrosFromStorage(): void {
    try {
      const stored = localStorage.getItem('artifacts-mmo-macros')
      if (stored) {
        const macrosArray: Macro[] = JSON.parse(stored)
        const macrosMap = new Map(macrosArray.map((m) => [m.id, m]))
        this.macros.set(macrosMap)
        this.logger.info(`Loaded ${macrosArray.length} macros from storage`, 'MacroService')
      }
    } catch (error) {
      this.logger.error('Failed to load macros from storage', 'MacroService', error)
    }
  }

  private saveMacrosToStorage(): void {
    try {
      const macrosArray = Array.from(this.macros().values())
      localStorage.setItem('artifacts-mmo-macros', JSON.stringify(macrosArray))
      this.logger.info(`Saved ${macrosArray.length} macros to storage`, 'MacroService')
    } catch (error) {
      this.logger.error('Failed to save macros to storage', 'MacroService', error)
    }
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  private generateMacroId(): string {
    return `macro_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
