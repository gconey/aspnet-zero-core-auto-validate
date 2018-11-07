import { Directive, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
    selector: '[maxvalue]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => MaxValueValidator), multi: true }
    ],
    host: { '[attr.max]': 'maxValue' }
})
export class MaxValueValidator implements Validator, OnChanges {

    @Input('maxvalue') maxValue: number;

    registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
    private _onChange: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        if ('maxValue' in changes) {
            if (this._onChange) this._onChange();
        }
    }

    validate(control: AbstractControl): { [key: string]: any } {
        const givenvalue = control.value;
        let validationResult = null;

        const maxValue = this.maxValue;

        if (maxValue && givenvalue > maxValue) {
            validationResult = validationResult || {};
            validationResult = { maxvalue: { requiredValue: this.maxValue }};
        }

        return validationResult;
    }
}
