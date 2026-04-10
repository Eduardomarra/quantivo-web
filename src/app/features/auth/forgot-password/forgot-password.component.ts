import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  forgotForm!: FormGroup;
  loading = false;
  submitted = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.forgotForm.invalid) {
      Object.keys(this.forgotForm.controls).forEach(key => {
        this.forgotForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: () => {
        this.emailSent = true;
        this.toastr.success('Email enviado com as instruções para redefinir sua senha.', 'Sucesso!');
        this.loading = false;
      },
      error: (error: any) => {
        let errorMessage = 'Erro ao enviar email de recuperação';

        if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.toastr.error(errorMessage, 'Erro');
        this.loading = false;
      }
    });
  }

}
