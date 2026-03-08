import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static readonly UNIPROT_PATTERN = /^([OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2})$/;

  static uniprotAccession(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.UNIPROT_PATTERN.test(control.value.toUpperCase());
      return valid ? null : { invalidUniprot: true };
    };
  }

  static fastaFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const trimmed = control.value.trim();
      if (!trimmed.startsWith('>')) {
        return { fastaNoHeader: true };
      }
      const lines = trimmed.split('\n').filter((l: string) => l.trim().length > 0);
      if (lines.length < 2) {
        return { fastaNoSequence: true };
      }
      return null;
    };
  }

  static minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return min > 0 ? { minArrayLength: { required: min, actual: 0 } } : null;
      }
      return control.value.length >= min
        ? null
        : { minArrayLength: { required: min, actual: control.value.length } };
    };
  }

  static numberRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      const value = Number(control.value);
      if (isNaN(value)) {
        return { notANumber: true };
      }
      if (value < min) {
        return { numberTooLow: { min, actual: value } };
      }
      if (value > max) {
        return { numberTooHigh: { max, actual: value } };
      }
      return null;
    };
  }
}
