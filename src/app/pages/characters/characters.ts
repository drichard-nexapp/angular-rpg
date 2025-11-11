import { Component, computed } from '@angular/core'
import { RouterLink } from '@angular/router'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getMyCharactersMyCharactersGet } from '../../../sdk/api'

@Component({
  selector: 'app-characters',
  imports: [RouterLink],
  templateUrl: './characters.html',
  styleUrl: './characters.scss',
})
export class Characters {
  charactersQuery = injectQuery(() => ({
    queryKey: ['my-characters'],
    queryFn: async () => {
      const response = await getMyCharactersMyCharactersGet()
      if (response && 'data' in response) {
        return (response.data as any)?.data || []
      }
      return []
    },
    staleTime: 1000 * 30,
  }))

  characters = computed(() => this.charactersQuery.data() ?? [])
  loading = computed(() => this.charactersQuery.isPending())
  error = computed(() => {
    const err = this.charactersQuery.error()
    return err ? (err as Error).message : null
  })
}
