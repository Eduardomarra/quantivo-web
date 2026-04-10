import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PublicGuard } from 'src/app/core/auth/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [PublicGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [PublicGuard]
  },
  // {
  //   path: 'forgot-password',
  //   component: ForgotPasswordComponent, // Será criado depois
  //   canActivate: [PublicGuard]
  // },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
