export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    nome: string;
    roles: string[];
}

export interface AuthState {
    isAuthenticated: boolean;
    user: LoginResponse | null;
    token: string | null;
}