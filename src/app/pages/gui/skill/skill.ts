import { Component, EventEmitter, input, Output } from '@angular/core'
import { Character } from '../../../domain/types'

@Component({
  selector: 'app-skill',
  imports: [],
  templateUrl: './skill.html',
  styleUrl: './skill.scss',
})
export class Skill {
  public selectedCharacter = input.required<Character>()
  @Output()
  public closeTrigger = new EventEmitter()

  public close() {
    this.closeTrigger.emit()
  }
}
