import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

export class FormUtils {
  static getControlError(control: AbstractControl | null, errorMessages: Record<string, string>): string | null {
    if (!control || !control.touched || !control.errors) {
      return null
    }

    const firstErrorKey = Object.keys(control.errors)[0]
    return errorMessages[firstErrorKey] || 'Invalid input'
  }

  static hasError(control: AbstractControl | null, errorType: string): boolean {
    return !!(control?.touched && control?.hasError(errorType))
  }

  static isInvalid(control: AbstractControl | null): boolean {
    return !!(control?.touched && control?.invalid)
  }

  static isValid(control: AbstractControl | null): boolean {
    return !!(control?.touched && control?.valid)
  }

  static markAllAsTouched(control: AbstractControl): void {
    control.markAsTouched()

    if ('controls' in control) {
      const controls = (control as any).controls
      if (Array.isArray(controls)) {
        controls.forEach(c => this.markAllAsTouched(c))
      } else {
        Object.keys(controls).forEach(key => {
          this.markAllAsTouched(controls[key])
        })
      }
    }
  }

  static resetForm(control: AbstractControl, value?: any): void {
    control.reset(value)
    control.markAsUntouched()
    control.markAsPristine()
  }

  static createRangeValidator(min: number, max: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value
      if (value === null || value === undefined || value === '') {
        return null
      }

      const numValue = Number(value)
      if (isNaN(numValue)) {
        return { range: { message: message || 'Must be a number' } }
      }

      if (numValue < min || numValue > max) {
        return { range: { message: message || `Must be between ${min} and ${max}` } }
      }

      return null
    }
  }

  static createMatchValidator(controlName: string, matchControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent
      if (!formGroup) {
        return null
      }

      const matchControl = formGroup.get(matchControlName)
      const currentControl = formGroup.get(controlName)

      if (!matchControl || !currentControl) {
        return null
      }

      if (currentControl.value !== matchControl.value) {
        return { match: { message: 'Values do not match' } }
      }

      return null
    }
  }

  static createWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value
      if (value === null || value === undefined || value === '') {
        return null
      }

      if (typeof value === 'string' && value.trim().length === 0) {
        return { whitespace: { message: 'Cannot be only whitespace' } }
      }

      return null
    }
  }
}
