import { Input, OnDestroy, OnInit, ElementRef, Directive, Renderer2 } from '@angular/core';
import { AbstractControl, ValidationErrors, NgForm, NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';

class ErrorDef {
    error: string;
    localizationKey: string;
    errorProperty: string;
}

class ControlDef {
    control: AbstractControl;
    controlElement: any;
    errorDiv: any;
    errorTextElement: any;
    statusChangeSubsscription: Subscription;
}

@Directive({
    selector: "[autoValidate]"
})
export class AutoValidateDirective implements OnInit, OnDestroy {
    @Input() preValidate: boolean = false;    
       
    errorDefs: ErrorDef[];
    controlDef: ControlDef;

    private formSubmitSubscription: Subscription;    
    
    public constructor(private parentForm: NgForm,
        private ngControl: NgControl,
        private controlElement: ElementRef,
        private renderer: Renderer2,
        private _appLocalizationService: AppLocalizationService) {
        
        this.errorDefs = [
            { error: 'required', localizationKey: 'ThisFieldIsRequired' } as ErrorDef,
            { error: 'minlength', localizationKey: 'PleaseEnterAtLeastNCharacter', errorProperty: 'requiredLength' } as ErrorDef,
            { error: 'maxlength', localizationKey: 'PleaseEnterNoMoreThanNCharacter', errorProperty: 'requiredLength' } as ErrorDef,
            { error: 'email', localizationKey: 'InvalidEmailAddress' } as ErrorDef,
            { error: 'pattern', localizationKey: 'InvalidPattern', errorProperty: 'requiredPattern' } as ErrorDef,
            { error: 'minvalue', localizationKey: 'PleaseEnterAtLeast', errorProperty: 'requiredValue' } as ErrorDef,
            { error: 'maxvalue', localizationKey: 'PleaseEnterNoMoreThan', errorProperty: 'requiredValue' } as ErrorDef
        ];
    }
    
    public ngOnInit(): void {
        this.initControlDef();

        // Subscribe to form submit            
        this.formSubmitSubscription = this.parentForm.ngSubmit.subscribe((evt) => {
            this.onFormSubmitHandler();
        });
    }

    private initControlDef(): void {
        setTimeout(() => {
            const controlElement = this.controlElement.nativeElement;
            if (!controlElement) return;

            let parentElement = controlElement.parentNode;
            if (!parentElement) return;

            // Handle inputs which are in input-groups 
            if (parentElement.classList.contains("input-group") && parentElement.parentNode) {
                parentElement = parentElement.parentNode;
            }

            this.controlDef = new ControlDef;

            this.controlDef.control = this.ngControl.control;
            this.controlDef.controlElement = this.controlElement.nativeElement;

            const errorContainerDiv = this.renderer.createElement('div');
            this.controlDef.errorDiv = this.renderer.createElement('div');
            this.renderer.appendChild(errorContainerDiv, this.controlDef.errorDiv);
            this.renderer.addClass(errorContainerDiv, "has-danger");
            this.renderer.addClass(this.controlDef.errorDiv, "form-control-feedback");
            this.renderer.appendChild(parentElement, errorContainerDiv);

            this.controlDef.statusChangeSubsscription = this.controlDef.control.statusChanges.subscribe((status) => {
                if (status === "INVALID") {
                    this.validateControl(this.controlDef);
                } else if (status === "VALID") {
                    this.makeValid(this.controlDef);
                }
            });

            this.controlDef.controlElement.addEventListener("blur", () => { this.validateControl(this.controlDef) });

            if (this.preValidate) this.validateControl(this.controlDef, true);            
        }, 0);
    }

    private onFormSubmitHandler(): void {
        this.validateControl(this.controlDef, true);
    }
    
    private validateControl(controlDef: ControlDef, preValidate: boolean = false): void {
        if (controlDef.control.invalid && (controlDef.control.touched || controlDef.control.dirty || preValidate)) {
            this.markAsTouched(controlDef);
            const primaryErrorKey = this.getFirstErrorKey(controlDef.control.errors);
            let errorMessage = this.getErrorMessage(controlDef, primaryErrorKey);
            this.makeInvalid(controlDef, errorMessage);
        } else if (controlDef.control.valid) {
            this.markAsTouched(controlDef);
            this.makeValid(controlDef);
        }
    }

    private markAsTouched(controlDef: ControlDef): void {
        if (controlDef && controlDef.control && !controlDef.control.touched) {
            controlDef.control.markAsTouched();
        }
    }

    private getFirstErrorKey(errors: ValidationErrors): string {
        const properties = Object.keys(errors).sort();
        return properties[0];
    }

    private getErrorMessage(controlDef: ControlDef, errorKey: string): string {
        const control = controlDef.control;

        if (!control.errors || control.errors.length == 0) return '';

        let errorDetails = this.errorDefs.filter(err => err.error == errorKey);
        if (!errorDetails || errorDetails.length == 0) return controlDef.controlElement.validationMessage;

        var errorDetail = errorDetails[0];

        let error = control.errors[errorDetail.error];
        if (!error) return controlDef.controlElement.validationMessage;

        let errorRequirement = error[errorDetail.errorProperty];
        const errorMessage = !!errorRequirement
            ? this._appLocalizationService.l(errorDetail.localizationKey, errorRequirement)
            : this._appLocalizationService.l(errorDetail.localizationKey);

        return errorMessage || controlDef.controlElement.validationMessage;
    }

    protected makeInvalid(controlDef: ControlDef, errorMessage: string): void {
        this.makeValid(controlDef);

        if (controlDef.errorDiv) {
            controlDef.errorTextElement = this.renderer.createText(errorMessage);            
            this.renderer.appendChild(controlDef.errorDiv, controlDef.errorTextElement);
        }
    }

    protected makeValid(controlDef: ControlDef): void {
        if (controlDef.errorDiv && controlDef.errorTextElement) {
            this.renderer.removeChild(controlDef.errorDiv, controlDef.errorTextElement)
            controlDef.errorTextElement = null;
        }
    }

    public ngOnDestroy(): void {
        if (this.formSubmitSubscription) this.formSubmitSubscription.unsubscribe();
        
        if (this.controlDef && this.controlDef.statusChangeSubsscription) {
            setTimeout(() => {
                this.controlDef.statusChangeSubsscription.unsubscribe();
            }, 0);
        }
    }
}
