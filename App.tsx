
import React, { useState, useMemo } from 'react';
import type { Insumo, InsumoParaAdicionar } from './types';
import { LOW_STOCK_THRESHOLD } from './constants';
import { Modal } from './components/Modal';
import { ItemForm } from './components/ItemForm';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from './components/Icons';

// Dados iniciais para demonstração
const DADOS_INICIAIS: Insumo[] = [
  { id: '1', nome: 'Farinha de Trigo', quantidade: 50, unidade: 'kg', categoria: 'Grãos', dataAdicao: '2023-10-26' },
  { id: '2', nome: 'Leite Integral', quantidade: 8, unidade: 'L', categoria: 'Laticínios', dataAdicao: '2023-10-27' },
  { id: '3', nome: 'Ovos', quantidade: 60, unidade: 'unidades', categoria: 'Proteínas', dataAdicao: '2023-10-25' },
  { id: '4', nome: 'Detergente', quantidade: 5, unidade: 'L', categoria: 'Limpeza', dataAdicao: '2023-10-20' },
  { id: '5', nome: 'Papel A4', quantidade: 2, unidade: 'resmas', categoria: 'Escritório', dataAdicao: '2023-09-15' },
];

// Componente para um card de estatística
interface StatCardProps {
  label: string;
  value: string | number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, colorClass }) => (
  <div className={`bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${colorClass}`}>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);


const App: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>(DADOS_INICIAIS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Insumo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddItem = (item: InsumoParaAdicionar) => {
    const newItem: Insumo = {
      ...item,
      id: new Date().getTime().toString(),
      dataAdicao: new Date().toISOString().split('T')[0],
    };
    setInsumos(prev => [newItem, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdateItem = (updatedItem: Insumo) => {
    setInsumos(prev => prev.map(item => (item.id === updatedItem.id ? updatedItem : item)));
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  const handleSubmit = (itemData: InsumoParaAdicionar | Insumo) => {
      if ('id' in itemData) {
          handleUpdateItem(itemData as Insumo);
      } else {
          handleAddItem(itemData as InsumoParaAdicionar);
      }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este insumo?")) {
      setInsumos(prev => prev.filter(item => item.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Insumo) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredInsumos = useMemo(() => {
    return insumos.filter(insumo =>
      insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insumo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [insumos, searchTerm]);
  
  const getStockStatus = (quantidade: number) => {
    if (quantidade === 0) return { text: 'Sem Estoque', color: 'bg-red-800/50 text-red-300' };
    if (quantidade <= LOW_STOCK_THRESHOLD) return { text: 'Baixo Estoque', color: 'bg-yellow-800/50 text-yellow-300' };
    return { text: 'Em Estoque', color: 'bg-green-800/50 text-green-300' };
  };

  const stats = useMemo(() => {
    const totalItems = insumos.length;
    const lowStockCount = insumos.filter(i => i.quantidade > 0 && i.quantidade <= LOW_STOCK_THRESHOLD).length;
    const outOfStockCount = insumos.filter(i => i.quantidade === 0).length;
    return { totalItems, lowStockCount, outOfStockCount };
  }, [insumos]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Sistema de Controle de Insumos</h1>
          <p className="text-indigo-400 mt-1">Gerencie seu inventário de forma eficiente e inteligente.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total de Itens" value={stats.totalItems} colorClass="border-indigo-500"/>
            <StatCard label="Itens com Baixo Estoque" value={stats.lowStockCount} colorClass="border-yellow-500"/>
            <StatCard label="Itens Sem Estoque" value={stats.outOfStockCount} colorClass="border-red-500"/>
        </div>

        <main className="bg-gray-800/50 rounded-lg shadow-lg p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:max-w-xs">
                <input
                    type="text"
                    placeholder="Buscar por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="text-gray-400"/>
                </div>
            </div>
            <button
              onClick={openAddModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-transform transform hover:scale-105"
            >
              <PlusIcon />
              Adicionar Insumo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Insumo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Quantidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                {filteredInsumos.length > 0 ? filteredInsumos.map(item => {
                   const status = getStockStatus(item.quantidade);
                   return (
                    <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.nome}</div>
                        <div className="text-sm text-gray-400">Adicionado em: {new Date(item.dataAdicao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.categoria}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.quantidade} {item.unidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => openEditModal(item)} className="text-indigo-400 hover:text-indigo-300 transition-colors" title="Editar">
                                <EditIcon />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Excluir">
                                <DeleteIcon />
                            </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                    <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400">
                            Nenhum insumo encontrado.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Editar Insumo' : 'Adicionar Novo Insumo'}
      >
        <ItemForm 
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            initialData={editingItem}
        />
      </Modal>
    </div>
  );
};

export default App;
