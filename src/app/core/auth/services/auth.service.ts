import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginRequest, LoginResponse } from '../../models/login-request';
import { RegisterRequest } from '../../models/register-request';

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
    console.log('Enviando login:', credentials);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Resposta do servidor:', response);
          if (response && response.token) {
            this.handleAuthResponse(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(data: LoginRequest): Observable<LoginResponse> {
    console.log('Enviando registro:', data);

    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          console.log('Resposta do servidor:', response);
          if (response && response.token) {
            this.handleAuthResponse(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    console.log('Realizando logout');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      console.log('Token obtido:', `${token.substring(0, 20)}...`);
    }
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
        console.error('Token inválido:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    console.log('Enviando email:', email);

    return this.http.post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(
        tap(response => {
          console.log('Email enviado com sucesso:', response);
        }),
        catchError(this.handleError)
      );
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-token`, { params: { token } });
  }

  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    console.log('Enviando redefinição de senha');

    return this.http.post(`${this.apiUrl}/save-password`, { token, newPassword: password, confirmPassword })
      .pipe(
        tap(response => {
          console.log('Senha redefinida com sucesso:', response);
        }),
        catchError(this.handleError)
      );
  }

  private handleAuthResponse(response: LoginResponse): void {
    console.log('Salvando dados do usuário:', response);
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response));
      this.authSubject.next(true);
      console.log('✅ Token salvo com sucesso!');
      console.log('Token:', `${response.token.substring(0, 30)}...`);
    }
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no auth service:', error);
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
