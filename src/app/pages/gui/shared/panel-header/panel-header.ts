import { Component, input, output } from '@angular/core'

@Component({
  selector: 'app-panel-header',
  imports: [],
  templateUrl: './panel-header.html',
  styleUrl: './panel-header.scss',
})
export class PanelHeader {
  title = input.required<string>()
  close = output<void>()

  onClose(): void {
    this.close.emit()
  }
}
