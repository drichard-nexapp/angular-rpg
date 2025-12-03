import { Component, inject } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { ConfirmDialog } from './components/shared/confirm-dialog/confirm-dialog'
import { ActionExecutorService } from './services/action-executor.service'
import { TilesService } from './stores/tilesStore/tiles.service'
import { ItemsService } from './stores/itemsStore/items.service'

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
  private tilesService = inject(TilesService)
  private itemsService = inject(ItemsService)

  constructor() {
    this.actionExecutor.initialize()
    this.tilesService.initialize()
    this.itemsService.initialize()
  }
}
