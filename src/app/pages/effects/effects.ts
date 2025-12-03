import { Component, computed, inject, signal } from '@angular/core'
import type { EffectSchema, EffectType, EffectSubtype } from '../../../sdk/api'
import { EffectsService } from '../../stores/effectsStore/effects.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-effects',
  imports: [CommonModule],
  templateUrl: './effects.html',
  styleUrl: './effects.scss',
})
export class Effects {
  private effectsService = inject(EffectsService)

  searchTerm = signal<string>('')
  typeFilter = signal<EffectType | ''>('')
  subtypeFilter = signal<EffectSubtype | ''>('')

  loading = this.effectsService.loading

  constructor() {
    this.effectsService.initialize()
  }

  filteredEffects = computed((): EffectSchema[] => {
    let effects = this.effectsService.effects() ?? []

    const search = this.searchTerm().toLowerCase()
    if (search) {
      effects = effects.filter(
        (effect) =>
          effect.name.toLowerCase().includes(search) ||
          effect.code.toLowerCase().includes(search) ||
          effect.description.toLowerCase().includes(search),
      )
    }

    const type = this.typeFilter()
    if (type) {
      effects = effects.filter((effect) => effect.type === type)
    }

    const subtype = this.subtypeFilter()
    if (subtype) {
      effects = effects.filter((effect) => effect.subtype === subtype)
    }

    return effects.sort((a, b) => a.name.localeCompare(b.name))
  })

  effectsLength = computed((): number => {
    return this.effectsService.effects()?.length ?? 0
  })

  types = computed((): EffectType[] => {
    const effects = this.effectsService.effects() ?? []
    const types = new Set<EffectType>()
    effects.forEach((effect) => types.add(effect.type))
    return Array.from(types).sort()
  })

  subtypes = computed((): EffectSubtype[] => {
    const effects = this.effectsService.effects() ?? []
    const subtypes = new Set<EffectSubtype>()
    effects.forEach((effect) => subtypes.add(effect.subtype))
    return Array.from(subtypes).sort()
  })

  setSearchTerm(term: string): void {
    this.searchTerm.set(term)
  }

  setTypeFilter(type: string): void {
    this.typeFilter.set(type as EffectType | '')
  }

  setSubtypeFilter(subtype: string): void {
    this.subtypeFilter.set(subtype as EffectSubtype | '')
  }

  clearFilters(): void {
    this.searchTerm.set('')
    this.typeFilter.set('')
    this.subtypeFilter.set('')
  }
}
