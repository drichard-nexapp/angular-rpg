import { inject, Injectable } from '@angular/core'
import { GrandExchangeStore } from './grand-exchange.store'
import { getGeSellOrdersGrandexchangeOrdersGet, type GeOrderSchema } from '../../../sdk/api'
import { unwrapApiResponse } from '../../shared/utils'
import { subHours } from 'date-fns'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({
  providedIn: 'root',
})
export class GrandExchangeService {
  private grandExchangeStore = inject(GrandExchangeStore)

  loading = toSignal(this.grandExchangeStore.useStore((state) => state.loading))
  orders = toSignal(this.grandExchangeStore.useStore((state) => Object.values(state.orders)))
  lastUpdated = toSignal(this.grandExchangeStore.useStore((state) => state.lastUpdated))

  private async fetchAllOrders(itemCode?: string): Promise<GeOrderSchema[]> {
    this.grandExchangeStore.setState({ loading: true })

    const response = await getGeSellOrdersGrandexchangeOrdersGet({
      query: {
        code: itemCode,
        size: 100,
      },
    })

    const orders = unwrapApiResponse<GeOrderSchema[]>(response, [])

    const ordersById = orders.reduce<Record<string, GeOrderSchema>>((acc, order) => {
      acc[order.id] = order
      return acc
    }, {})

    this.grandExchangeStore.setState({
      orders: ordersById,
      loading: false,
      lastUpdated: new Date(),
    })

    return orders
  }

  getOrder(id: string): GeOrderSchema | null {
    return this.grandExchangeStore.getState().orders[id] ?? null
  }

  async refreshOrders(itemCode?: string): Promise<void> {
    await this.fetchAllOrders(itemCode)
  }

  initialize() {
    this.grandExchangeStore.initStore()
    const state = this.grandExchangeStore.getState()

    if (!state.lastUpdated || state.lastUpdated <= subHours(new Date(), 1)) {
      void this.fetchAllOrders().then((orders) => {
        this.grandExchangeStore.setState({
          orders: orders.reduce<Record<string, GeOrderSchema>>((acc, val) => {
            return { ...acc, [val.id]: val }
          }, {}),
          loading: false,
          lastUpdated: new Date(),
        })
      })
    } else {
      this.grandExchangeStore.setState({ loading: false })
    }
  }
}
