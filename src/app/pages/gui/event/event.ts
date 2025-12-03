import { Component, input } from '@angular/core'
import type { ActiveEvent } from '../../../domain/types'

@Component({
  selector: 'app-event',
  templateUrl: './event.html',
  styleUrl: './event.scss',
  imports: [],
})
export class Event {
  activeEvents = input.required<ActiveEvent[]>()
}
