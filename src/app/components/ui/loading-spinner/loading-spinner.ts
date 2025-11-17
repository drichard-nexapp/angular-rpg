import { Component, input } from '@angular/core'

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
})
export class LoadingSpinner {
  size = input<'small' | 'medium' | 'large'>('medium')
  message = input<string>()
}
