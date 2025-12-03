import { Component, computed, inject, signal, effect } from '@angular/core'
import type { Skill, TaskFullSchema } from '../../../sdk/api'
import { TasksService } from '../../stores/tasksStore/tasks.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-tasks',
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks {
  private tasksService = inject(TasksService)

  filterSkill = signal<Skill | undefined>(undefined)
  filterMinLevel = signal<number | undefined>(undefined)
  filterMaxLevel = signal<number | undefined>(undefined)

  loading = this.tasksService.loading

  constructor() {
    this.tasksService.initialize()

    effect(() => {
      const skill = this.filterSkill()
      const minLevel = this.filterMinLevel()
      const maxLevel = this.filterMaxLevel()

      void this.tasksService.refreshTasks(skill, minLevel, maxLevel)
    })
  }

  filteredTasks = computed((): TaskFullSchema[] => {
    const tasks = this.tasksService.tasks() ?? []
    const skill = this.filterSkill()
    const minLevel = this.filterMinLevel()
    const maxLevel = this.filterMaxLevel()

    return tasks.filter((task) => {
      if (skill && task.skill !== skill) return false
      if (minLevel && task.level < minLevel) return false
      if (maxLevel && task.level > maxLevel) return false
      return true
    })
  })

  clearFilters(): void {
    this.filterSkill.set(undefined)
    this.filterMinLevel.set(undefined)
    this.filterMaxLevel.set(undefined)
  }
}
