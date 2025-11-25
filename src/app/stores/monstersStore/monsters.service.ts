import { inject, Injectable } from '@angular/core'

import { MonstersStore } from './monsters.store'
import { getMonsterMonstersCodeGet } from '../../../sdk/api'
import { unwrapApiItem } from '../../shared/utils'
import type { Monster } from '../../domain/types'
import { subDays } from 'date-fns'

@Injectable({
  providedIn: 'root',
})
export class MonstersService {
  private monstersStore = inject(MonstersStore)

  async fetchMonsterDetails(code: string) {
    if (!code) return null
    const cachedMonster = this.monstersStore.getState().monsters[code]
    if (cachedMonster) {
      return cachedMonster
    }
    this.monstersStore.setState({ loading: true })
    const response = await getMonsterMonstersCodeGet({
      path: {
        code,
      },
    })

    const monster = unwrapApiItem<Monster>(response, null)
    if (monster) {
      this.monstersStore.getState().add(monster)
    }
    this.monstersStore.setState({ loading: false })

    return monster
  }

  initialize() {
    this.monstersStore.initStore()
    const state = this.monstersStore.getState()

    if (state.lastUpdated && state.lastUpdated <= subDays(new Date(), 7))
      this.monstersStore.setState({
        monsters: {},
        loading: false,
        lastUpdated: new Date(),
      })
  }
}
