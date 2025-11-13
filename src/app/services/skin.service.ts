import { Injectable } from '@angular/core'
import type { CharacterSkin } from '../../sdk/api'

@Injectable({
  providedIn: 'root',
})
export class SkinService {
  private readonly skinSymbols: Partial<Record<CharacterSkin, string>> & Record<string, string> = {
    men1: '🧙‍♂️',
    men2: '⚔️',
    men3: '🛡️',
    women1: '🧙‍♀️',
    women2: '🏹',
    women3: '🗡️',
    corrupted1: '👹',
    zombie1: '🧟',
    marauder1: '🏴‍☠️',
  }

  getSymbol(skin: string): string {
    return this.skinSymbols[skin] || '❓'
  }
}
