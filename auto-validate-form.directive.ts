import { Input, OnDestroy, OnInit, ElementRef, Directive } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    selector: "[autoValidateForm]"
})
export class AutoValidateFormDirective implements OnInit, OnDestroy {
    @Input() tabSet;
           
    private formSubmitSubscription: Subscription;    
    
    public constructor(private ngForm: NgForm,
        private formElement: ElementRef) {
        
    }
    
    public ngOnInit(): void {
        // Subscribe to form submit            
        this.formSubmitSubscription = this.ngForm.ngSubmit.subscribe((evt) => {
            this.onFormSubmitHandler();
        });
    }

    private onFormSubmitHandler(): void {
        if (!this.formElement.nativeElement || !this.formElement.nativeElement.children || this.formElement.nativeElement.children.lenght == 0) return;

        setTimeout(() => {
            this.highlightFirstInvalidControl(this.formElement.nativeElement);
        }, 0);
    }

    private highlightFirstInvalidControl(parentElement: any): boolean {
        if (!parentElement || !parentElement.children || parentElement.children.length == 0) return;

        for (let element of parentElement.children) {
            if (element.className == "form-control-feedback" && element.innerText != "") {
                this.makeTabActive(element);

                setTimeout(() => {
                    let controlElement: any = undefined;
                    if (element && element.parentNode && element.parentNode.previousSibling) {
                        controlElement = element.parentNode.previousSibling;
                    } else {
                        controlElement = element;
                    }                    
                                        
                    (controlElement.parentNode || controlElement).scrollIntoView();
                    
                    controlElement.focus();
                }, 0);

                return true;
            }

            if (element.children && element.children.length > 0) {
                if (this.highlightFirstInvalidControl(element)) return true;
            }
        }

        return false;
    }

    private makeTabActive(formElement: any): void {
        // Find the parent tab element of this control, if the control is in a tab
        const nodeTabElement = this.getTabOfElement(formElement);
        if (nodeTabElement && this.tabSet && this.tabSet.tabs && this.tabSet.tabs.length > 0) {
            // find the tab that is the parent of the current control
            const parentTabs = this.tabSet.tabs.filter(tab => tab.elementRef && tab.elementRef.nativeElement && tab.elementRef.nativeElement.id == nodeTabElement.id);

            if (parentTabs && parentTabs.length > 0) {
                parentTabs[0].active = 1;
            }
        }
    }

    // Find the parent tab element of this control, if the control is in a tab
    private getTabOfElement(elementToFindTabOf: any): any {        
        let currentParent = elementToFindTabOf.parentNode;
        if (!currentParent) return null;

        let safetyCount = 1000;
        while (currentParent) {            
            currentParent = currentParent.parentNode;
            if (--safetyCount === 0) {
                throw new Error("Something went wrong. Found 1000+ parents!")
            }
                       
            if (currentParent && currentParent.localName == 'tab') {                
                return currentParent;
            }
        }

        return null;
    }

    public ngOnDestroy(): void {
        if (this.formSubmitSubscription) this.formSubmitSubscription.unsubscribe();
    }
}
