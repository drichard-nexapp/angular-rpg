import { inject, Injectable } from '@angular/core'
import { TasksStore } from './tasks.store'
import { getAllTasksTasksListGet, type TaskFullSchema, type Skill } from '../../../sdk/api'
import { unwrapApiResponse } from '../../shared/utils'
import { subDays } from 'date-fns'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private tasksStore = inject(TasksStore)

  loading = toSignal(this.tasksStore.useStore((state) => state.loading))
  tasks = toSignal(this.tasksStore.useStore((state) => Object.values(state.tasks)))
  lastUpdated = toSignal(this.tasksStore.useStore((state) => state.lastUpdated))

  private async fetchAllTasks(
    skill?: Skill,
    minLevel?: number,
    maxLevel?: number,
  ): Promise<TaskFullSchema[]> {
    this.tasksStore.setState({ loading: true })

    const response = await getAllTasksTasksListGet({
      query: {
        skill,
        min_level: minLevel,
        max_level: maxLevel,
        size: 100,
      },
    })

    const tasks = unwrapApiResponse<TaskFullSchema[]>(response, [])

    const tasksByCode = tasks.reduce<Record<string, TaskFullSchema>>((acc, task) => {
      acc[task.code] = task
      return acc
    }, {})

    this.tasksStore.setState({
      tasks: tasksByCode,
      loading: false,
      lastUpdated: new Date(),
    })

    return tasks
  }

  getTask(code: string): TaskFullSchema | null {
    return this.tasksStore.getState().tasks[code] ?? null
  }

  async refreshTasks(skill?: Skill, minLevel?: number, maxLevel?: number): Promise<void> {
    await this.fetchAllTasks(skill, minLevel, maxLevel)
  }

  initialize() {
    this.tasksStore.initStore()
    const state = this.tasksStore.getState()

    if (!state.lastUpdated || state.lastUpdated <= subDays(new Date(), 7)) {
      void this.fetchAllTasks().then((tasks) => {
        this.tasksStore.setState({
          tasks: tasks.reduce<Record<string, TaskFullSchema>>((acc, val) => {
            return { ...acc, [val.code]: val }
          }, {}),
          loading: false,
          lastUpdated: new Date(),
        })
      })
    }
  }
}
