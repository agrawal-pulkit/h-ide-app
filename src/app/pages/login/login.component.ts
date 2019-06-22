import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService, AuthenticationService } from './../../../services/user-service';

@Component({templateUrl: 'login.component.html'})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService) {}

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        // this.route.snapshot.queryParams['returnUrl'] 
        this.returnUrl = '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        console.log("returnUrl:: ", this.returnUrl);
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    if (data && data.userObject == null){
                        this.alertService.error(data.status.value);
                        this.loading = false; 
                    }
                    // else if (!data.userObject.isValidUser){
                    //     this.alertService.error("Please verify your user. We have sent verification link in your inbox.");
                    //     this.loading = false; 
                    // }
                    else{
                        this.router.navigate([this.returnUrl]);
                    }
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
