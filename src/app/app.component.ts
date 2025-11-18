import { Component, inject } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { ConfirmDialog } from './components/shared/confirm-dialog/confirm-dialog'
import { ActionExecutorService } from './services/action-executor.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmDialog],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'angular-app'
  private actionExecutor = inject(ActionExecutorService)

  constructor() {
    this.actionExecutor.initialize()
  }
}
