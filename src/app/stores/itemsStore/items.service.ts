import { inject, Injectable } from '@angular/core'
import { ItemsStore } from './items.store'
import { getAllItemsItemsGet, type ItemSchema } from '../../../sdk/api'
import { unwrapApiResponse } from '../../shared/utils'
import { subDays } from 'date-fns'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private itemsStore = inject(ItemsStore)

  loading = toSignal(this.itemsStore.useStore((state) => state.loading))
  items = toSignal(this.itemsStore.useStore((state) => Object.values(state.items)))

  private async fetchAllItems(): Promise<ItemSchema[]> {
    const cachedItems = Object.values(this.itemsStore.getState().items)
    if (cachedItems.length > 0) {
      return cachedItems
    }

    this.itemsStore.setState({ loading: true })

    const response = await getAllItemsItemsGet({
      query: { size: 100 },
    })

    const items = unwrapApiResponse<ItemSchema[]>(response, [])

    const itemsByCode = items.reduce<Record<string, ItemSchema>>((acc, item) => {
      acc[item.code] = item
      return acc
    }, {})

    this.itemsStore.setState({
      items: itemsByCode,
      loading: false,
      lastUpdated: new Date(),
    })

    return items
  }

  getItem(code: string): ItemSchema | null {
    return this.itemsStore.getState().items[code] ?? null
  }

  initialize() {
    this.itemsStore.initStore()
    const state = this.itemsStore.getState()

    if (!state.lastUpdated || state.lastUpdated <= subDays(new Date(), 7)) {
      void this.fetchAllItems().then((items) => {
        this.itemsStore.setState({
          items: items.reduce<Record<string, ItemSchema>>((acc, val) => {
            return { ...acc, [val.code]: val }
          }, {}),
          loading: false,
          lastUpdated: new Date(),
        })
      })
    } else {
      this.itemsStore.setState({ loading: false })
    }
  }
}
