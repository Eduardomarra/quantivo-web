import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ListaService } from 'src/app/core/services/lista.service';
import { ListaMensalTO, ItemListaTO } from 'src/app/core/models/lista.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.component.html',
  styleUrls: ['./list-details.component.scss']
})
export class ListDetailsComponent implements OnInit {

  lista: ListaMensalTO | null = null;
  loading = true;

  // Modal State
  showModal = false;
  novoItemNome = '';
  novoItemQtde: number = 1;
  novoItemValor: number = 0;
  adicionandoItem = false;
  erroModal = '';
  itemEditandoId: string | null = null;
  totalItens: number = 0;
  valorTotal: number = 0;
  searchTerm: string = '';

  // Modal Confirmar Exclusão State
  showConfirmDelete = false;
  itemParaDeletar: ItemListaTO | null = null;
  deletandoItem = false;

  get itensFiltrados(): ItemListaTO[] {
    if (!this.lista?.itens) return [];
    if (!this.searchTerm.trim()) return this.lista.itens;
    const termo = this.searchTerm.toLowerCase().trim();
    return this.lista.itens.filter(item =>
      item.nomeProduto.toLowerCase().includes(termo)
    );
  }

  private meses: string[] = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor(
    private route: ActivatedRoute,
    private listaService: ListaService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carregarLista(id);
      }
    });
  }

  carregarLista(id: string) {
    this.loading = true;

    // Busca os dados da lista e os itens da lista simultaneamente
    forkJoin({
      detalhes: this.listaService.getListaPorId(id),
      itens: this.listaService.getItem(id)
    }).subscribe({
      next: (result) => {
        this.lista = result.detalhes;
        this.lista.itens = result.itens;
        this.totalItens = result.itens.length;
        this.valorTotal = result.itens.reduce((acc, item) => acc + item.valorUnitario * item.quantidade, 0);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar lista ou itens:', err);
        this.loading = false;
      }
    });
  }

  getNomeMes(mes: number | undefined): string {
    if (!mes) return '';
    return this.meses[mes] || '';
  }

  // --- Modal: Adicionar / Editar Item ---

  abrirModal(item?: ItemListaTO): void {
    if (item) {
      this.itemEditandoId = item.id || null;
      this.novoItemNome = item.nomeProduto;
      this.novoItemQtde = item.quantidade;
      this.novoItemValor = item.valorUnitario;
    } else {
      this.itemEditandoId = null;
      this.novoItemNome = '';
      this.novoItemQtde = 1;
      this.novoItemValor = 0;
    }
    this.erroModal = '';
    this.adicionandoItem = false;
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
  }

  salvarItem(): void {
    if (!this.lista || !this.lista.idLista) return;

    if (!this.novoItemNome.trim()) {
      this.erroModal = 'O nome do produto é obrigatório.';
      return;
    }

    if (this.novoItemQtde <= 0) {
      this.erroModal = 'A quantidade deve ser maior que zero.';
      return;
    }

    if (this.novoItemValor < 0) {
      this.erroModal = 'O valor unitário deve ser maior que zero.';
      return;
    }

    this.adicionandoItem = true;
    this.erroModal = '';

    const payload = {
      nomeProduto: this.novoItemNome,
      quantidade: this.novoItemQtde,
      valorUnitario: this.novoItemValor
    };

    if (this.itemEditandoId) {
      this.listaService.alterarItem(this.itemEditandoId, payload).subscribe({
        next: () => {
          this.adicionandoItem = false;
          this.showModal = false;
          if (this.lista?.idLista) {
            this.carregarLista(this.lista.idLista);
          }
        },
        error: (err) => {
          console.error('Erro ao editar item:', err);
          this.erroModal = 'Erro ao editar item. Tente novamente.';
          this.adicionandoItem = false;
        }
      });
    } else {
      this.listaService.adicionarItem(this.lista.idLista, payload).subscribe({
        next: () => {
          this.adicionandoItem = false;
          this.showModal = false;
          if (this.lista?.idLista) {
            this.carregarLista(this.lista.idLista);
          }
        },
        error: (err) => {
          console.error('Erro ao adicionar item:', err);
          this.erroModal = 'Erro ao adicionar item. Tente novamente.';
          this.adicionandoItem = false;
        }
      });
    }
  }

  // --- Deletar Item ---
  confirmarExclusaoItem(item: ItemListaTO): void {
    this.itemParaDeletar = item;
    this.showConfirmDelete = true;
  }

  fecharConfirmDelete(): void {
    this.showConfirmDelete = false;
    this.itemParaDeletar = null;
  }

  deletarItem(): void {
    if (!this.itemParaDeletar || !this.itemParaDeletar.id) return;

    this.deletandoItem = true;
    this.listaService.deletarItem(this.itemParaDeletar.id).subscribe({
      next: () => {
        this.deletandoItem = false;
        this.fecharConfirmDelete();
        if (this.lista?.idLista) {
          this.carregarLista(this.lista.idLista);
        }
      },
      error: (err) => {
        console.error('Erro ao deletar item:', err);
        this.deletandoItem = false;
        this.fecharConfirmDelete();
      }
    });
  }
}
