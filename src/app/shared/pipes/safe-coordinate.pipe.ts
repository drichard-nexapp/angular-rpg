import { Pipe, PipeTransform } from '@angular/core'
import type { Character } from '../../domain/types'
import { CharacterUtils } from '../utils'

@Pipe({
  name: 'safeCoordinate',
  standalone: true,
})
export class SafeCoordinatePipe implements PipeTransform {
  transform(character: Character | null, coord: 'x' | 'y'): string | unknown {
    if (!CharacterUtils.hasValidPosition(character)) {
      return '?'
    }
    return character?.[coord].toString()
  }
}

@Pipe({
  name: 'safePosition',
  standalone: true,
})
export class SafePositionPipe implements PipeTransform {
  transform(character: Character | null): string {
    const position = CharacterUtils.getPosition(character)
    if (!position) {
      return '(?, ?)'
    }
    return `(${position.x}, ${position.y})`
  }
}
