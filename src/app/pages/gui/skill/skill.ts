import { Component, EventEmitter, input, Output } from '@angular/core'
import { Character } from '../../../domain/types'
import { PanelHeader } from '../shared/panel-header/panel-header'

@Component({
  selector: 'app-skill',
  imports: [PanelHeader],
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
