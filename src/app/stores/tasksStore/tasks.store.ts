import { Injectable } from '@angular/core'
import { StateCreator, ZustandBaseService } from 'ngx-zustand'
import { createStore } from 'zustand/vanilla'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TaskFullSchema } from '../../../sdk/api'

interface TasksState {
  tasks: Record<string, TaskFullSchema>
  lastUpdated: Date | null
  loading: boolean
}

@Injectable({
  providedIn: 'root',
})
export class TasksStore extends ZustandBaseService<TasksState> {
  initStore(): StateCreator<TasksState> {
    return () => ({
      tasks: {},
      lastUpdated: null,
      loading: true,
    })
  }

  override createStore() {
    return createStore(
      persist<TasksState>(this.initStore(), {
        name: 'tasksStore',
        storage: createJSONStorage(() => localStorage),
      }),
    )
  }
}
