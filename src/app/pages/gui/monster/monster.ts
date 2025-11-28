import { Component, EventEmitter, input, Output } from '@angular/core'
import { getMonsterImageUrl } from '../../../shared/asset-urls'
import { MonsterSchema } from '../../../../sdk/api'

@Component({
  selector: 'app-monster',
  templateUrl: './monster.html',
})
export class Monster {
  public monsterDetails = input.required<MonsterSchema>()

  @Output()
  public closeTrigger = new EventEmitter()

  public close() {
    this.closeTrigger.emit()
  }
  protected readonly getMonsterImageUrl = getMonsterImageUrl
}
