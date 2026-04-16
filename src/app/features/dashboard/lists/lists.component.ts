import { Component, OnInit } from '@angular/core';
import { ListaService } from 'src/app/core/services/lista.service';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { ListaMensalTO } from 'src/app/core/models/lista.model';
import { Router } from '@angular/router';

interface ListasPorAno {
  ano: number;
  anoAtual: boolean;
  listas: ListaMensalTO[];
}

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

  listasAgrupadas: ListasPorAno[] = [];
  loading = true;

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
    const user = this.authService.getUser();
    if (user && user.id) {
      this.listaService.getListasPorUsuarioId(user.id).subscribe({
        next: (lists) => {
          this.agruparPorAno(lists);
          this.loading = false;
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

  agruparPorAno(listas: ListaMensalTO[]): void {
    const anoAtual = new Date().getFullYear();
    const grupos: { [ano: number]: ListaMensalTO[] } = {};

    listas.forEach(lista => {
      if (!grupos[lista.ano]) {
        grupos[lista.ano] = [];
      }
      grupos[lista.ano].push(lista);
    });

    this.listasAgrupadas = Object.keys(grupos)
      .map(Number)
      .sort((a, b) => b - a)
      .map(ano => ({
        ano,
        anoAtual: ano === anoAtual,
        listas: grupos[ano].sort((a, b) => a.mes - b.mes)
      }));
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
}
