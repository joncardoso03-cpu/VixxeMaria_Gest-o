

export interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  categoria: string;
  preco: number;
  created_at: string;
}

export type InsumoParaAdicionar = Omit<Insumo, 'id' | 'created_at'>;

export interface Categoria {
  id: string;
  nome: string;
  created_at: string;
}

export type CategoriaParaAdicionar = Omit<Categoria, 'id' | 'created_at'>;

export interface Unidade {
  id: string;
  nome: string;
  created_at: string;
}

export type UnidadeParaAdicionar = Omit<Unidade, 'id' | 'created_at'>;