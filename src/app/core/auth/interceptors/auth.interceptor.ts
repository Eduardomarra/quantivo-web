import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const isAuthRequest = req.url.includes('/auth/');
    const isLoginRequest = req.url.includes('/auth/login');

    console.log('Interceptor - URL:', req.url);
    console.log('Interceptor - Tem token?', !!token);

    let authReq = req;

    if (token && !isLoginRequest) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('✅ Token adicionado ao header:', `Bearer ${token.substring(0, 20)}...`);
    } else if (isLoginRequest) {
      console.log('🔓 Requisição de login - sem token');
    } else if (!token && !isAuthRequest) {
      console.log('⚠️ Requisição sem token - pode causar 401');
    }

    const authHeader = authReq.headers.get('Authorization');
    console.log('Header Authorization final:', authHeader ? `${authHeader.substring(0, 30)}...` : 'nenhum');

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro na requisição:', error.status, error.message);

        if (error.status === 401 && !isLoginRequest) {
          console.log('Token expirado ou inválido - fazendo logout');
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }
}
