import { Component, computed, inject, signal } from '@angular/core'
import type { ItemSchema } from '../../../sdk/api'
import { ItemsService } from '../../stores/itemsStore/items.service'

@Component({
  selector: 'app-items',
  imports: [],
  templateUrl: './items.html',
  styleUrl: './items.scss',
})
export class Items {
  protected itemsService = inject(ItemsService)

  searchTerm = signal<string>('')
  typeFilter = signal<string>('')
  craftableFilter = signal<boolean>(false)

  loading = this.itemsService.loading

  constructor() {
    this.itemsService.initialize()
  }

  filteredItems = computed((): ItemSchema[] => {
    let items = this.itemsService.items() ?? []

    const search = this.searchTerm().toLowerCase()
    if (search) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.code.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search),
      )
    }

    const type = this.typeFilter()
    if (type) {
      items = items.filter((item) => item.type === type)
    }

    if (this.craftableFilter()) {
      items = items.filter((item) => item.craft?.skill)
    }

    return items
  })

  itemsLength = computed((): number => {
    return this.itemsService.items()?.length ?? 0
  })

  itemTypes = computed((): string[] => {
    const items = this.itemsService.items() ?? []
    const types = new Set(items.map((item) => item.type))
    return Array.from(types).sort()
  })

  setSearchTerm(term: string): void {
    this.searchTerm.set(term)
  }

  setTypeFilter(type: string): void {
    this.typeFilter.set(type)
  }

  toggleCraftableFilter(): void {
    this.craftableFilter.set(!this.craftableFilter())
  }

  clearFilters(): void {
    this.searchTerm.set('')
    this.typeFilter.set('')
    this.craftableFilter.set(false)
  }
}
