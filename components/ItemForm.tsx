
import React, { useState, useEffect } from 'react';
import type { Insumo, InsumoParaAdicionar } from '../types';
import { SparklesIcon } from './Icons';
import { suggestItemDetails } from '../services/geminiService';

interface ItemFormProps {
  onSubmit: (item: InsumoParaAdicionar | Insumo) => void;
  onCancel: () => void;
  initialData?: Insumo | null;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [item, setItem] = useState<InsumoParaAdicionar | Insumo>(
    initialData || { nome: '', quantidade: 0, unidade: '', categoria: '' }
  );
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (initialData) {
      setItem(initialData);
    } else {
      setItem({ nome: '', quantidade: 0, unidade: '', categoria: '' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: name === 'quantidade' ? Number(value) : value }));
  };

  const handleAISuggest = async () => {
      if (!item.nome) {
          setAiError("Digite o nome do item para obter sugestões.");
          return;
      }
      setIsAISuggesting(true);
      setAiError('');
      try {
          const suggestions = await suggestItemDetails(item.nome);
          setItem(prev => ({...prev, ...suggestions}));
      } catch(error: any) {
          setAiError(error.message || "Falha ao buscar sugestão.");
      } finally {
          setIsAISuggesting(false);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.nome.trim() === '') return;
    onSubmit(item);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-300">Nome do Insumo</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={item.nome}
          onChange={handleChange}
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white"
          required
        />
      </div>
      
      <div className="relative">
          <button 
              type="button" 
              onClick={handleAISuggest}
              disabled={isAISuggesting || !item.nome}
              className="absolute top-0 right-0 mt-1 flex items-center px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed rounded-md text-white transition-colors"
          >
              <SparklesIcon className="w-4 h-4 mr-1" />
              {isAISuggesting ? 'Sugerindo...' : 'Sugerir com IA'}
          </button>
          {aiError && <p className="text-red-400 text-xs mt-1">{aiError}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-300">Categoria</label>
          <input
            type="text"
            id="categoria"
            name="categoria"
            value={item.categoria}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="unidade" className="block text-sm font-medium text-gray-300">Unidade de Medida</label>
          <input
            type="text"
            id="unidade"
            name="unidade"
            value={item.unidade}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white"
            placeholder="Ex: kg, L, un"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-300">Quantidade</label>
        <input
          type="number"
          id="quantidade"
          name="quantidade"
          value={item.quantidade}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          {initialData ? 'Salvar Alterações' : 'Adicionar Insumo'}
        </button>
      </div>
    </form>
  );
};
