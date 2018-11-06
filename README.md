# aspnet-zero-core-auto-validate

Auto validation components for use in ASP.NET Zero Core

These directives simplify form validation in ASP.NET Zero Core.

## auto-validate.directive 
This can be added to any form input control to provide automatic validation of the control as follows:

`<input type="text" id="Channel_Name" class="form-control" [(ngModel)]="channel.name" name="Name" minlength="1" maxlength="100" required autoValidate>`

There is no need to add anything other than autoValidate. Adding this directive will result in correct validation of the control and display of localized error messages as required.

## auto-validate-form.directive 

This can be added to a form control to highlight and set focus to the first invalid control when the user attempts to submit the form.
The directive is added to the form as follows:

`<form *ngIf="active" #channelForm="ngForm" novalidate (ngSubmit)="channelForm.form.valid ? save() : null" autocomplete="off" autoValidateForm>`

Note that the (ngSubmit) is also configured slightly differently to allow the directive to work when the use clicks submit.

If the first invalid control is in a tab then the form also switches to that tab if the tabSet template variable is specified in the tabSet parameter as follows:

`<form *ngIf="active" #textTypeForm="ngForm" novalidate (ngSubmit)="textTypeForm.form.valid ? save() : null" autocomplete="off" autoValidateForm [tabSet]="tabset">`

## min & max value validation directives

These can be added to numeric form input controls to validate the values in the controls. They work well with the auto validation directives.
Add them to controls as folows:

`<input class="form-control" type="number" [minvalue]="0" [maxvalue]="10" name="valueControl" [(ngModel)]="numValue" autoValidate>`
