import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // if (this.authService.isAuthenticated()) {
    //   this.router.navigate(['/dashboard']);
    // }
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha');
    const confirmarSenha = control.get('confirmarSenha');

    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const { confirmarSenha, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.toastr.success('Conta criada com sucesso! Faça login para continuar.', 'Sucesso!');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        let errorMessage = 'Erro ao criar conta';

        if (error.status === 409) {
          errorMessage = 'Este email já está cadastrado';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.toastr.error(errorMessage, 'Erro');
        this.loading = false;
      }
    });
  }

}
