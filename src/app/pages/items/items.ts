import { Component, computed, signal } from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getAllItemsItemsGet, type ItemSchema } from '../../../sdk/api'
import { unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS } from '../../shared/constants'
import { APP_CONFIG } from '../../shared/constants'

@Component({
  selector: 'app-items',
  imports: [],
  templateUrl: './items.html',
  styleUrl: './items.scss',
})
export class Items {
  searchTerm = signal<string>('')
  typeFilter = signal<string>('')
  craftableFilter = signal<boolean>(false)

  itemsQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.items.all(),
    queryFn: async (): Promise<ItemSchema[]> => {
      const response = await getAllItemsItemsGet({
        query: { size: 100 },
      })
      return unwrapApiResponse<ItemSchema[]>(response, [])
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_LONG,
  }))

  allItems = computed((): ItemSchema[] => this.itemsQuery.data() ?? [])

  filteredItems = computed((): ItemSchema[] => {
    let items = this.allItems()

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

  itemTypes = computed((): string[] => {
    const types = new Set(this.allItems().map((item) => item.type))
    return Array.from(types).sort()
  })

  loading = computed((): boolean => this.itemsQuery.isPending())
  error = computed((): string | null => {
    const itemsError = this.itemsQuery.error()
    if (itemsError) return (itemsError).message
    return null
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
