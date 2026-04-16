import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginRequest, LoginResponse } from '../../models/login-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}auth`;
  private tokenKey = 'access_token';
  private userKey = 'user_data';

  private authSubject = new BehaviorSubject<boolean>(this.hasToken());
  public auth$ = this.authSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { observe: 'response' })
      .pipe(
        tap(response => {
          const body = response.body;
          const authHeader = response.headers.get('Authorization');

          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (body) {
              body.token = token; // Anexamos ao corpo para compatibilidade com o resto do sistema
            }
            this.handleAuthResponse(body);
          } else if (body && body.token) {
            this.handleAuthResponse(body);
          }
        }),
        map(response => response.body as LoginResponse),
        catchError(this.handleError)
      );
  }

  register(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/register`, data, { observe: 'response' })
      .pipe(
        tap(response => {
          const body = response.body;
          const authHeader = response.headers.get('Authorization');

          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (body) {
              body.token = token;
            }
            this.handleAuthResponse(body);
          } else if (body && body.token) {
            this.handleAuthResponse(body);
          }
        }),
        map(response => response.body as LoginResponse),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token;
  }

  getUser(): LoginResponse | null {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    const hasToken = this.hasToken();
    return hasToken;
  }

  verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Token não encontrado'));
    }

    return this.http.get(`${this.apiUrl}/verify`).pipe(
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        tap(response => {
        }),
        catchError(this.handleError)
      );
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-token`, { params: { token } });
  }

  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {

    return this.http.post(`${this.apiUrl}/save-password`, { token, newPassword: password, confirmPassword })
      .pipe(
        tap(response => {
        }),
        catchError(this.handleError)
      );
  }

  private handleAuthResponse(response: LoginResponse): void {
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response));
      this.authSubject.next(true);
    }
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Erro na autenticação';

    if (error.status === 401) {
      errorMessage = 'Email ou senha inválidos';
    } else if (error.status === 403) {
      errorMessage = 'Acesso negado';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
