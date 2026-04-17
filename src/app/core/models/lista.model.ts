export interface ItemListaTO {
  id?: string;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal?: number;
}

export interface ListaMensalTO {
  idLista?: string;
  usuarioId: string;
  mes: number;
  ano: number;
  descricao: string;
  dataCriacao?: string;
  status?: 'PENDENTE' | 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
  itens?: ItemListaTO[];
  totalItens?: number;
  valorTotal?: number;
}

export interface CriarListaMensalTO {
  usuarioId: string;
  descricao: string;
}

export interface AdicionarItemTO {
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
}

export interface AlterarItemTO {
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
}

export interface ResumoListaTO {
  totalItens: number;
  valorTotal: number;
  status: string;
}
