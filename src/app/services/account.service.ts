import { Injectable, signal } from '@angular/core'
import { getAccountDetailsMyDetailsGet, type MyAccountDetails } from '../../sdk/api'
import { unwrapApiItem } from '../shared/utils'

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  accountData = signal<MyAccountDetails | null>(null)
  loading = signal<boolean>(false)
  error = signal<string | null>(null)

  async fetchAccountDetails(): Promise<void> {
    this.loading.set(true)
    this.error.set(null)

    try {
      const response = await getAccountDetailsMyDetailsGet()
      const data = unwrapApiItem<MyAccountDetails>(response)
      this.accountData.set(data)
    } catch (err) {
      this.error.set((err as Error).message)
      console.error('Error fetching account details:', err)
    } finally {
      this.loading.set(false)
    }
  }
}
