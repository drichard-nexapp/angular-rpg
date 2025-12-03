import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { signal } from '@angular/core'

interface TestData {
  message: string
  users: Array<{
    id: number
    name: string
    role: string
  }>
  settings: {
    theme: string
    language: string
    notifications: boolean
  }
}

@Injectable({
  providedIn: 'root',
})
export class DataLoaderService {
  private http = inject(HttpClient)

  data = signal<TestData | null>(null)
  loading = signal<boolean>(false)
  error = signal<string | null>(null)

  async loadTestData() {
    this.loading.set(true)
    this.error.set(null)

    try {
      const data = await this.http.get<TestData>('/assets/test-data.json').toPromise()
      this.data.set(data ?? null)
      console.log('Data loaded successfully:', data)
    } catch (err) {
      this.error.set((err as Error).message)
      console.error('Error loading data:', err)
    } finally {
      this.loading.set(false)
    }
  }
}
