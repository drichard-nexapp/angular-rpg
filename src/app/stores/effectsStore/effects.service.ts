import { inject, Injectable } from '@angular/core'
import { EffectsStore } from './effects.store'
import { getAllEffectsEffectsGet, type EffectSchema } from '../../../sdk/api'
import { unwrapApiResponse } from '../../shared/utils'
import { subDays } from 'date-fns'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({
  providedIn: 'root',
})
export class EffectsService {
  private effectsStore = inject(EffectsStore)

  loading = toSignal(this.effectsStore.useStore((state) => state.loading))
  effects = toSignal(this.effectsStore.useStore((state) => Object.values(state.effects)))
  lastUpdated = toSignal(this.effectsStore.useStore((state) => state.lastUpdated))

  private async fetchAllEffects(): Promise<EffectSchema[]> {
    this.effectsStore.setState({ loading: true })

    const response = await getAllEffectsEffectsGet({
      query: { size: 100 },
    })

    const effects = unwrapApiResponse<EffectSchema[]>(response, [])

    const effectsByCode = effects.reduce<Record<string, EffectSchema>>((acc, effect) => {
      acc[effect.code] = effect
      return acc
    }, {})

    this.effectsStore.setState({
      effects: effectsByCode,
      loading: false,
      lastUpdated: new Date(),
    })

    return effects
  }

  getEffect(code: string): EffectSchema | null {
    return this.effectsStore.getState().effects[code] ?? null
  }

  async refreshEffects(): Promise<void> {
    await this.fetchAllEffects()
  }

  initialize() {
    this.effectsStore.initStore()
    const state = this.effectsStore.getState()

    if (!state.lastUpdated || state.lastUpdated <= subDays(new Date(), 7)) {
      void this.fetchAllEffects().then((effects) => {
        this.effectsStore.setState({
          effects: effects.reduce<Record<string, EffectSchema>>((acc, val) => {
            return { ...acc, [val.code]: val }
          }, {}),
          loading: false,
          lastUpdated: new Date(),
        })
      })
    } else {
      this.effectsStore.setState({ loading: false })
    }
  }
}
