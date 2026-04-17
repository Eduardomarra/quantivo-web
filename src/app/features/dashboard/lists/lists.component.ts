import { Component, OnInit } from '@angular/core';
import { ListaService } from 'src/app/core/services/lista.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { ListaMensalTO } from 'src/app/core/models/lista.model';
import { Router } from '@angular/router';

interface ListasPorMes {
  mes: number;
  listas: ListaMensalTO[];
}

interface ListasPorAno {
  ano: number;
  anoAtual: boolean;
  meses: ListasPorMes[];
}

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

  listasAgrupadas: ListasPorAno[] = [];
  loading = true;

  //ResumoLista
  totalItens: number = 0;
  valorTotal: number = 0;

  // Modal state
  showModal = false;
  novaDescricao = '';
  salvandoLista = false;
  erroModal = '';
  listaEditandoId: string | null = null;

  // Delete Confirm State
  showConfirmDelete = false;
  listaParaDeletar: ListaMensalTO | null = null;
  deletandoLista = false;

  private meses: string[] = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private listaService: ListaService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists() {
    this.loading = true;
    const user = this.authService.getUser();
    if (user && user.id) {
      this.listaService.getListasPorUsuarioId(user.id, true).subscribe({
        next: (lists) => {
          if (lists.length === 0) {
            this.agruparPorAnoEMes([]);
            this.loading = false;
            return;
          }

          let concluidos = 0;
          lists.forEach(lista => {
            if (lista.idLista) {
              this.listaService.getResumoLista(lista.idLista).subscribe({
                next: (resumo) => {
                  lista.totalItens = resumo.totalItens;
                  lista.valorTotal = resumo.valorTotal;
                },
                error: (err) => console.error('Erro ao buscar resumo da lista', lista.idLista, err),
                complete: () => {
                  concluidos++;
                  if (concluidos === lists.length) {
                    this.agruparPorAnoEMes(lists);
                    this.loading = false;
                  }
                }
              });
            } else {
              concluidos++;
              if (concluidos === lists.length) {
                this.agruparPorAnoEMes(lists);
                this.loading = false;
              }
            }
          });
        },
        error: (err) => {
          console.error('Erro ao carregar listas:', err);
          this.loading = false;
        }
      });
    } else {
      console.warn('Usuário não logado ou ID não encontrado.');
      this.loading = false;
    }
  }

  agruparPorAnoEMes(listas: ListaMensalTO[]): void {
    const anoAtual = new Date().getFullYear();

    // Agrupar por ano
    const gruposAno: { [ano: number]: ListaMensalTO[] } = {};
    listas.forEach(lista => {
      if (!gruposAno[lista.ano]) {
        gruposAno[lista.ano] = [];
      }
      gruposAno[lista.ano].push(lista);
    });

    // Para cada ano, agrupar por mês
    this.listasAgrupadas = Object.keys(gruposAno)
      .map(Number)
      .sort((a, b) => b - a)
      .map(ano => {
        const listasPorMes: { [mes: number]: ListaMensalTO[] } = {};
        gruposAno[ano].forEach(lista => {
          if (!listasPorMes[lista.mes]) {
            listasPorMes[lista.mes] = [];
          }
          listasPorMes[lista.mes].push(lista);
        });

        const meses: ListasPorMes[] = Object.keys(listasPorMes)
          .map(Number)
          .sort((a, b) => a - b)
          .map(mes => ({
            mes,
            listas: listasPorMes[mes]
          }));

        return { ano, anoAtual: ano === anoAtual, meses };
      });
  }

  getNomeMes(mes: number): string {
    return this.meses[mes] || '';
  }

  formatarData(dataCriacao: string | undefined): string {
    if (!dataCriacao) return '';
    const date = new Date(dataCriacao);
    const mes = this.meses[date.getMonth() + 1]?.substring(0, 3) || '';
    return `${mes} ${date.getDate()}, ${date.getFullYear()}`;
  }

  acessarLista(lista: ListaMensalTO): void {
    this.router.navigate(['/dashboard/listas', lista.idLista]);
  }

  // --- Modal: Nova / Editar Lista ---

  novaLista(): void {
    this.listaEditandoId = null;
    this.novaDescricao = '';
    this.erroModal = '';
    this.salvandoLista = false;
    this.showModal = true;
  }

  editarLista(lista: ListaMensalTO, event: Event): void {
    event.stopPropagation();
    this.listaEditandoId = lista.idLista || null;
    this.novaDescricao = lista.descricao;
    this.erroModal = '';
    this.salvandoLista = false;
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
  }

  salvarLista(): void {
    const descricao = this.novaDescricao.trim();
    if (!descricao) {
      this.erroModal = 'A descrição é obrigatória.';
      return;
    }

    const user = this.authService.getUser();
    if (!user || !user.id) {
      this.erroModal = 'Usuário não autenticado.';
      return;
    }

    this.salvandoLista = true;
    this.erroModal = '';

    if (this.listaEditandoId) {
      this.listaService.editarLista(descricao, this.listaEditandoId).subscribe({
        next: () => {
          this.showModal = false;
          this.salvandoLista = false;
          this.loadLists();
        },
        error: (err) => {
          console.error('Erro ao editar lista:', err);
          this.erroModal = 'Erro ao editar lista. Tente novamente.';
          this.salvandoLista = false;
        }
      });
    } else {
      this.listaService.criarLista({ usuarioId: user.id, descricao }).subscribe({
        next: () => {
          this.showModal = false;
          this.salvandoLista = false;
          this.loadLists();
        },
        error: (err) => {
          console.error('Erro ao criar lista:', err);
          this.erroModal = 'Erro ao criar lista. Tente novamente.';
          this.salvandoLista = false;
        }
      });
    }
  }

  // --- Deletar Lista ---
  confirmarExclusaoLista(lista: ListaMensalTO, event: Event): void {
    event.stopPropagation();
    this.listaParaDeletar = lista;
    this.showConfirmDelete = true;
  }

  fecharConfirmDelete(): void {
    this.showConfirmDelete = false;
    this.listaParaDeletar = null;
  }

  deletarLista(): void {
    if (!this.listaParaDeletar || !this.listaParaDeletar.idLista) return;

    this.deletandoLista = true;
    this.listaService.deletarLista(this.listaParaDeletar.idLista).subscribe({
      next: () => {
        this.deletandoLista = false;
        this.fecharConfirmDelete();
        this.loadLists();
      },
      error: (err) => {
        console.error('Erro ao deletar lista:', err);
        this.deletandoLista = false;
        this.fecharConfirmDelete();
      }
    });
  }
}
