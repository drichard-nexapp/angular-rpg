import { Component, computed, signal } from '@angular/core'
import { injectQuery } from '@tanstack/angular-query-experimental'
import { getAllTasksTasksListGet, type Skill } from '../../../sdk/api'
import type { TaskFull } from '../../domain/types'
import { unwrapApiResponse } from '../../shared/utils'
import { QUERY_KEYS } from '../../shared/constants/query-keys'
import { APP_CONFIG } from '../../shared/constants/app-config'

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks {
  filterSkill = signal<Skill | undefined>(undefined)
  filterMinLevel = signal<number | undefined>(undefined)
  filterMaxLevel = signal<number | undefined>(undefined)

  tasksQuery = injectQuery(() => ({
    queryKey: QUERY_KEYS.tasks.list(
      this.filterSkill(),
      this.filterMinLevel(),
      this.filterMaxLevel(),
    ),
    queryFn: async (): Promise<TaskFull[]> => {
      const response = await getAllTasksTasksListGet({
        query: {
          skill: this.filterSkill(),
          min_level: this.filterMinLevel(),
          max_level: this.filterMaxLevel(),
        },
      })

      return unwrapApiResponse<TaskFull[]>(response, [])
    },
    staleTime: APP_CONFIG.CACHE.STALE_TIME_10_MIN,
  }))

  tasks = computed((): TaskFull[] => this.tasksQuery.data() ?? [])
  loading = computed((): boolean => this.tasksQuery.isPending())
  error = computed((): string | null => {
    const err = this.tasksQuery.error()
    return err ? (err as Error).message : null
  })

  availableSkills = computed((): string[] => {
    const skills = new Set<string>()
    this.tasks().forEach((task) => {
      if (task.skill) skills.add(task.skill)
    })
    return Array.from(skills).sort()
  })

  setSkillFilter(skill: Skill | undefined): void {
    this.filterSkill.set(skill)
  }

  clearFilters(): void {
    this.filterSkill.set(undefined)
    this.filterMinLevel.set(undefined)
    this.filterMaxLevel.set(undefined)
  }

  getTasksByType(type: string): TaskFull[] {
    return this.tasks().filter((task) => task.type === type)
  }

  getTaskTypes(): string[] {
    const types = new Set<string>()
    this.tasks().forEach((task) => {
      types.add(task.type)
    })
    return Array.from(types).sort()
  }
}
