import React, { useState, useEffect } from 'react';
import type { Insumo, InsumoParaAdicionar, Categoria, Unidade } from '../types';
import { PlusIcon } from './Icons';

interface ItemFormProps {
  onSubmit: (item: InsumoParaAdicionar | Insumo) => void;
  onCancel: () => void;
  initialData?: Insumo | InsumoParaAdicionar | null;
  categorias: Categoria[];
  unidades: Unidade[];
  onRequestAddCategory: (currentItemState: Insumo | InsumoParaAdicionar) => void;
  onRequestAddUnidade: (currentItemState: Insumo | InsumoParaAdicionar) => void;
}

// Tipo customizado para o estado do formulário para permitir string vazia para o preço
type FormItemState = Omit<InsumoParaAdicionar, 'preco'> & { preco: string | number } & { id?: string };

export const ItemForm: React.FC<ItemFormProps> = ({ onSubmit, onCancel, initialData, categorias, unidades, onRequestAddCategory, onRequestAddUnidade }) => {
  
  const getInitialState = (): FormItemState => {
      if (initialData) {
          // Garante que o preço seja uma string para o input do formulário
          return { ...initialData, preco: String(initialData.preco || '') };
      }
      return { nome: '', unidade: '', categoria: '', preco: '' };
  };

  const [item, setItem] = useState<FormItemState>(getInitialState());

  useEffect(() => {
    setItem(getInitialState());
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'preco') {
        // Permite valor vazio ou formato de número decimal válido
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
             setItem(prev => ({ ...prev, [name]: value }));
        }
        return;
    }
    
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.nome.trim() === '' || item.categoria.trim() === '' || item.unidade.trim() === '') return;
    
    // Converte o preço de volta para número no submit
    const itemToSubmit = {
        ...item,
        preco: parseFloat(String(item.preco).replace(',', '.')) || 0,
    };
    
    onSubmit(itemToSubmit as Insumo | InsumoParaAdicionar);
  };
  
  const formInputClass = "block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-800 dark:text-white";
  const selectPlaceholderClass = "invalid:text-gray-400 dark:invalid:text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Nome do Insumo */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nome do Insumo</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={item.nome}
          onChange={handleChange}
          className={formInputClass}
          placeholder="Ex: Farinha de Trigo Tipo 1"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categoria */}
        <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Categoria</label>
            <div className="flex items-center gap-2">
                <select
                    id="categoria"
                    name="categoria"
                    value={item.categoria}
                    onChange={handleChange}
                    className={`${formInputClass} flex-grow ${selectPlaceholderClass}`}
                    required
                >
                    <option value="" disabled>Selecione uma categoria</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
                </select>
                <button 
                    type="button" 
                    onClick={() => onRequestAddCategory(item as Insumo | InsumoParaAdicionar)}
                    className="p-2.5 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors shrink-0"
                    aria-label="Adicionar nova categoria"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      
        {/* Unidade de Medida */}
        <div>
            <label htmlFor="unidade" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Unidade de Medida</label>
            <div className="flex items-center gap-2">
                 <select
                    id="unidade"
                    name="unidade"
                    value={item.unidade}
                    onChange={handleChange}
                    className={`${formInputClass} flex-grow ${selectPlaceholderClass}`}
                    required
                >
                    <option value="" disabled>Selecione uma unidade</option>
                    {unidades.map(un => <option key={un.id} value={un.nome}>{un.nome}</option>)}
                </select>
                <button 
                    type="button" 
                    onClick={() => onRequestAddUnidade(item as Insumo | InsumoParaAdicionar)}
                    className="p-2.5 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors shrink-0"
                    aria-label="Adicionar nova unidade de medida"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

        {/* Preço */}
        <div>
            <label htmlFor="preco" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Preço (R$)</label>
            <input
                type="text"
                inputMode="decimal"
                id="preco"
                name="preco"
                value={item.preco}
                onChange={handleChange}
                placeholder="0,00"
                className={formInputClass}
                required
            />
        </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
        >
          {item.id ? 'Salvar Alterações' : 'Adicionar Insumo'}
        </button>
      </div>
    </form>
  );
};
