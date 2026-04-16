import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  ListaMensalTO, 
  CriarListaMensalTO, 
  AdicionarItemTO, 
  AlterarItemTO, 
  ItemListaTO, 
  ResumoListaTO 
} from '../models/lista.model';

@Injectable({
  providedIn: 'root'
})
export class ListaService {
  private apiUrl = `${environment.apiUrl}lista-mensal`;

  /** Cache interno das listas do usuário */
  private listasCache: ListaMensalTO[] | null = null;
  private cachedUsuarioId: string | null = null;

  constructor(private http: HttpClient) { }

  /**
   * [POST] /lista-mensal/criar
   * Cria uma nova lista mensal para o usuário.
   */
  criarLista(data: CriarListaMensalTO): Observable<ListaMensalTO> {
    return this.http.post<ListaMensalTO>(`${this.apiUrl}/criar`, data).pipe(
      tap(() => this.invalidarCache())
    );
  }

  /**
   * [GET] /lista-mensal/lista-id/{id}
   * Busca os detalhes de uma lista específica pelo ID.
   */
  getListaPorId(id: string): Observable<ListaMensalTO> {
    return this.http.get<ListaMensalTO>(`${this.apiUrl}/lista-id/${id}`);
  }

  /**
   * [GET] /lista-mensal/usuario-id/{id}
   * Busca todas as listas de compras do usuário.
   * Retorna o cache se existir, caso contrário faz a chamada HTTP.
   */
  getListasPorUsuarioId(usuarioId: string, forceRefresh = false): Observable<ListaMensalTO[]> {
    if (!forceRefresh && this.listasCache && this.cachedUsuarioId === usuarioId) {
      return of(this.listasCache);
    }

    return this.http.get<ListaMensalTO[]>(`${this.apiUrl}/usuario-id/${usuarioId}`).pipe(
      tap(listas => {
        this.listasCache = listas;
        this.cachedUsuarioId = usuarioId;
      })
    );
  }

  /**
   * [DELETE] /lista-mensal/deletar/{id}
   * Deleta uma lista mensal pelo ID.
   */
  deletarLista(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deletar/${id}`).pipe(
      tap(() => this.invalidarCache())
    );
  }

  /**
   * [POST] /lista-mensal/{listaId}/itens
   * Adiciona um item em uma lista específica.
   */
  adicionarItem(listaId: string, item: AdicionarItemTO): Observable<ItemListaTO> {
    return this.http.post<ItemListaTO>(`${this.apiUrl}/${listaId}/itens`, item).pipe(
      tap(() => this.invalidarCache())
    );
  }

  /**
   * [PUT] /lista-mensal/itens/{itemId}
   * Altera um item existente.
   */
  alterarItem(itemId: string, item: AlterarItemTO): Observable<ItemListaTO> {
    return this.http.put<ItemListaTO>(`${this.apiUrl}/itens/${itemId}`, item).pipe(
      tap(() => this.invalidarCache())
    );
  }

  /**
   * [DELETE] /lista-mensal/deletar-item/{id}
   * Deleta um item específico pelo ID.
   */
  deletarItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deletar-item/${id}`).pipe(
      tap(() => this.invalidarCache())
    );
  }

  /**
   * [GET] /lista-mensal/resumo/{listaId}
   * Traz o resumo da lista (Total Itens e Valor Total).
   */
  getResumoLista(listaId: string): Observable<ResumoListaTO> {
    return this.http.get<ResumoListaTO>(`${this.apiUrl}/resumo/${listaId}`);
  }

  /**
   * Limpa o cache para forçar nova busca na próxima chamada.
   */
  invalidarCache(): void {
    this.listasCache = null;
    this.cachedUsuarioId = null;
  }
}
