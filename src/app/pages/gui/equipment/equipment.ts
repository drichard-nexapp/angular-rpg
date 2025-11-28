import { Component, EventEmitter, input, Output } from '@angular/core'
import { Character } from '../../../domain/types'
import { getItemImageUrl } from '../../../shared/asset-urls'

@Component({
  selector: 'app-equipment',
  imports: [],
  templateUrl: './equipment.html',
  styleUrl: './equipment.scss',
})
export class Equipment {
  public selectedCharacter = input.required<Character>()
  protected readonly getItemImageUrl = getItemImageUrl

  @Output()
  public closeTrigger = new EventEmitter()

  public close() {
    this.closeTrigger.emit()
  }
}
