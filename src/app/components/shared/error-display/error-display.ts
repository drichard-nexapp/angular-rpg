import { Component, inject } from '@angular/core'
import { ErrorHandlerService } from '../../../services/error-handler.service'

@Component({
  selector: 'app-error-display',
  standalone: true,
  templateUrl: './error-display.html',
  styleUrl: './error-display.scss',
})
export class ErrorDisplay {
  errorHandler = inject(ErrorHandlerService)

  close(): void {
    const error = this.errorHandler.currentError()
    if (error) {
      this.errorHandler.clearError(error)
    }
  }
}
