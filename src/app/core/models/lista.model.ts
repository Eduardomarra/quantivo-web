export interface ItemListaTO {
  id?: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal?: number;
}

export interface ListaMensalTO {
  idLista?: string;
  usuarioId: string;
  mes: number;
  ano: number;
  dataCriacao?: string;
  status?: 'PENDENTE' | 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
  itens?: ItemListaTO[];
  totalItens?: number;
  valorTotal?: number;
}

export interface CriarListaMensalTO {
  usuarioId: string;
}

export interface AdicionarItemTO {
  produto: string;
  quantidade: number;
  valorUnitario: number;
}

export interface AlterarItemTO {
  produto: string;
  quantidade: number;
  valorUnitario: number;
}

export interface ResumoListaTO {
  totalItens: number;
  valorTotal: number;
  status: string;
}
