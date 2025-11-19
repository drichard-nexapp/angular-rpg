import { Component, inject } from '@angular/core'
import { ConfirmDialogService } from '../../../services'

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  dialogService = inject(ConfirmDialogService)

  onConfirm(): void {
    this.dialogService.handleConfirm()
  }

  onCancel(): void {
    this.dialogService.handleCancel()
  }

  onBackdropClick(): void {
    this.dialogService.handleCancel()
  }

  onDialogClick(event: Event): void {
    event.stopPropagation()
  }
}
