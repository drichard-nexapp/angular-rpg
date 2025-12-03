import { Component, computed, inject, signal } from '@angular/core'
import type { GeOrderSchema } from '../../../sdk/api'
import { GrandExchangeService } from '../../stores/grandExchangeStore/grand-exchange.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-grand-exchange',
  imports: [CommonModule],
  templateUrl: './grand-exchange.html',
  styleUrl: './grand-exchange.scss',
})
export class GrandExchange {
  private grandExchangeService = inject(GrandExchangeService)

  searchTerm = signal<string>('')
  itemCodeFilter = signal<string>('')

  loading = this.grandExchangeService.loading

  constructor() {
    this.grandExchangeService.initialize()
  }

  filteredOrders = computed((): GeOrderSchema[] => {
    let orders = this.grandExchangeService.orders() ?? []

    const search = this.searchTerm().toLowerCase()
    if (search) {
      orders = orders.filter(
        (order) =>
          order.code.toLowerCase().includes(search) ||
          order.seller.toLowerCase().includes(search) ||
          order.id.toLowerCase().includes(search),
      )
    }

    const itemCode = this.itemCodeFilter()
    if (itemCode) {
      orders = orders.filter((order) => order.code === itemCode)
    }

    return orders.sort((a, b) => a.price - b.price)
  })

  ordersLength = computed((): number => {
    return this.grandExchangeService.orders()?.length ?? 0
  })

  itemCodes = computed((): string[] => {
    const orders = this.grandExchangeService.orders() ?? []
    const codes = new Set(orders.map((order) => order.code))
    return Array.from(codes).sort()
  })

  setSearchTerm(term: string): void {
    this.searchTerm.set(term)
  }

  setItemCodeFilter(code: string): void {
    this.itemCodeFilter.set(code)
  }

  clearFilters(): void {
    this.searchTerm.set('')
    this.itemCodeFilter.set('')
  }

  async refreshOrders(): Promise<void> {
    await this.grandExchangeService.refreshOrders(this.itemCodeFilter() || undefined)
  }
}
