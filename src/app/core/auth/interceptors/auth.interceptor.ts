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

    let authReq = req;

    if (token && !isLoginRequest) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    } else if (isLoginRequest) {
    } else if (!token && !isAuthRequest) {
    }

    const authHeader = authReq.headers.get('Authorization');

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 && !isLoginRequest) {
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }
}
