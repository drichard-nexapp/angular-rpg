import { Injectable, signal } from '@angular/core'

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmDanger?: boolean
}

interface DialogState extends ConfirmDialogOptions {
  visible: boolean
  resolve?: (value: boolean) => void
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private dialogState = signal<DialogState>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmDanger: false,
  })

  readonly state = this.dialogState.asReadonly()

  async confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dialogState.set({
        ...options,
        visible: true,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmDanger: options.confirmDanger || false,
        resolve,
      })
    })
  }

  handleConfirm(): void {
    const state = this.dialogState()
    if (state.resolve) {
      state.resolve(true)
    }
    this.close()
  }

  handleCancel(): void {
    const state = this.dialogState()
    if (state.resolve) {
      state.resolve(false)
    }
    this.close()
  }

  private close(): void {
    this.dialogState.update((state) => ({ ...state, visible: false }))
  }
}
