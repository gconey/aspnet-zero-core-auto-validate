import { Directive, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
    selector: '[minvalue]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MinValueValidator), multi: true }
    ],
    host: { '[attr.min]': 'minValue' }
})
export class MinValueValidator implements Validator, OnChanges {

    @Input('minvalue') minValue: number;

    registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
    private _onChange: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        if ('minValue' in changes) {
            if (this._onChange) this._onChange();
        }
    }

    validate(control: AbstractControl): { [key: string]: any } {
        const givenvalue = control.value;
        let validationResult = null;

        const minValue = this.minValue;

        if (minValue && givenvalue < minValue) {
            validationResult = validationResult || {};
            validationResult = { minvalue: { requiredValue: this.minValue } };
        }

        return validationResult;
    }
}
