
export interface Insumo {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  dataAdicao: string;
}

export type InsumoParaAdicionar = Omit<Insumo, 'id' | 'dataAdicao'>;
