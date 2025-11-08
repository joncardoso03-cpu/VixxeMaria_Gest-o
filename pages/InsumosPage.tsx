import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Insumo, InsumoParaAdicionar, Categoria, CategoriaParaAdicionar, Unidade, UnidadeParaAdicionar } from '../types';
import { Modal } from '../components/Modal';
import { ItemForm } from '../components/ItemForm';
import { PlusIcon, EditIcon, DeleteIcon, SearchIcon } from '../components/Icons';
import { supabase } from '../services/supabase';

const NameEntityForm: React.FC<{
    onSubmit: (name: string) => void;
    onCancel: () => void;
    initialData?: { nome: string } | null;
    entityName: string;
}> = ({ onSubmit, onCancel, initialData, entityName }) => {
    const [name, setName] = useState(initialData?.nome || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="entity-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome {entityName === 'Unidade' ? 'da' : 'do'} {entityName}</label>
                <input
                    id="entity-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-800 dark:text-white"
                    required
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 dark:border-slate-600 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm">Salvar</button>
            </div>
        </form>
    );
};


export const InsumosPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'insumos' | 'categorias' | 'unidades'>('insumos');
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [modalContent, setModalContent] = useState<'insumo' | 'categoria' | 'unidade' | null>(null);
    const [editingInsumo, setEditingInsumo] = useState<Insumo | InsumoParaAdicionar | null>(null);
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
    const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [insumoFormStateCache, setInsumoFormStateCache] = useState<Insumo | InsumoParaAdicionar | null>(null);


    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const insumosPromise = supabase.from('insumos').select('*').order('nome', { ascending: true });
            const categoriasPromise = supabase.from('categorias').select('*').order('nome', { ascending: true });
            const unidadesPromise = supabase.from('unidades').select('*').order('nome', { ascending: true });

            const [insumosResult, categoriasResult, unidadesResult] = await Promise.all([insumosPromise, categoriasPromise, unidadesPromise]);

            if (insumosResult.error) throw insumosResult.error;
            if (categoriasResult.error) throw categoriasResult.error;
            if (unidadesResult.error) throw unidadesResult.error;
            
            setInsumos(insumosResult.data as Insumo[]);
            setCategorias(categoriasResult.data as Categoria[]);
            setUnidades(unidadesResult.data as Unidade[]);

        } catch (err: any) {
            console.error('Erro ao buscar dados:', err);
            setError('Não foi possível carregar os dados.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredInsumos = useMemo(() => {
        return insumos.filter(insumo =>
            insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            insumo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [insumos, searchTerm]);
    
    const filteredCategorias = useMemo(() => {
        return categorias.filter(cat =>
            cat.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categorias, searchTerm]);

    const filteredUnidades = useMemo(() => {
        return unidades.filter(un =>
            un.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [unidades, searchTerm]);


    // --- CRUD Insumos ---
    const handleAddInsumo = async (item: InsumoParaAdicionar) => {
        const { data, error } = await supabase.from('insumos').insert([item]).select();
        if (error) {
            console.error("Erro ao adicionar insumo:", error);
            alert("Falha ao adicionar o insumo.");
        } else if (data) {
            setInsumos(prev => [...prev, ...data as Insumo[]].sort((a, b) => a.nome.localeCompare(b.nome)));
            closeModal();
        }
    };

    const handleUpdateInsumo = async (itemToUpdate: Insumo) => {
        const { id, created_at, ...updateData } = itemToUpdate;
        const { data, error } = await supabase.from('insumos').update(updateData).eq('id', id).select();
        if (error) {
            console.error("Erro ao atualizar insumo:", error);
            alert("Falha ao atualizar o insumo.");
        } else if (data) {
            setInsumos(prev => prev.map(item => item.id === id ? (data[0] as Insumo) : item));
            closeModal();
        }
    };

    const handleDeleteInsumo = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este insumo?")) {
            const { error } = await supabase.from('insumos').delete().eq('id', id);
            if (error) {
                console.error("Erro ao excluir insumo:", error);
                alert("Falha ao excluir o insumo.");
            } else {
                setInsumos(prev => prev.filter(item => item.id !== id));
            }
        }
    };
    
    // --- CRUD Categorias ---
    const handleAddCategoria = async (name: string) => {
        const { data, error } = await supabase.from('categorias').insert([{ nome: name }]).select();
        if (error) {
            console.error("Erro ao adicionar categoria:", error);
            alert(error.message.includes('unique constraint') ? 'Essa categoria já existe.' : 'Falha ao adicionar a categoria.');
        } else if (data) {
            const newCategory = data[0] as Categoria;
            setCategorias(prev => [...prev, newCategory].sort((a, b) => a.nome.localeCompare(b.nome)));
            
            if (insumoFormStateCache) {
                const updatedInsumoData = { ...insumoFormStateCache, categoria: newCategory.nome };
                setEditingInsumo(updatedInsumoData);
                setInsumoFormStateCache(null);
                setModalContent('insumo');
            } else {
                closeModal();
            }
        }
    };
    
    const handleUpdateCategoria = async (id: string, name: string) => {
        const { data, error } = await supabase.from('categorias').update({ nome: name }).eq('id', id).select();
         if (error) {
            console.error("Erro ao atualizar categoria:", error);
            alert(error.message.includes('unique constraint') ? 'Essa categoria já existe.' : 'Falha ao atualizar a categoria.');
        } else if (data) {
            setCategorias(prev => prev.map(cat => cat.id === id ? data[0] as Categoria : cat));
            closeModal();
        }
    };

    const handleDeleteCategoria = async (id: string) => {
         if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
            const { error } = await supabase.from('categorias').delete().eq('id', id);
            if (error) {
                console.error("Erro ao excluir categoria:", error);
                alert("Falha ao excluir a categoria.");
            } else {
                setCategorias(prev => prev.filter(cat => cat.id !== id));
            }
        }
    };
    
    // --- CRUD Unidades ---
    const handleAddUnidade = async (name: string) => {
        const { data, error } = await supabase.from('unidades').insert([{ nome: name }]).select();
        if (error) {
            console.error("Erro ao adicionar unidade:", error);
            alert(error.message.includes('unique constraint') ? 'Essa unidade já existe.' : 'Falha ao adicionar a unidade.');
        } else if (data) {
            const newUnidade = data[0] as Unidade;
            setUnidades(prev => [...prev, newUnidade].sort((a, b) => a.nome.localeCompare(b.nome)));
            
            if (insumoFormStateCache) {
                const updatedInsumoData = { ...insumoFormStateCache, unidade: newUnidade.nome };
                setEditingInsumo(updatedInsumoData);
                setInsumoFormStateCache(null);
                setModalContent('insumo');
            } else {
                closeModal();
            }
        }
    };
    
    const handleUpdateUnidade = async (id: string, name: string) => {
        const { data, error } = await supabase.from('unidades').update({ nome: name }).eq('id', id).select();
         if (error) {
            console.error("Erro ao atualizar unidade:", error);
            alert(error.message.includes('unique constraint') ? 'Essa unidade já existe.' : 'Falha ao atualizar a unidade.');
        } else if (data) {
            setUnidades(prev => prev.map(un => un.id === id ? data[0] as Unidade : un));
            closeModal();
        }
    };

    const handleDeleteUnidade = async (id: string) => {
         if (window.confirm("Tem certeza que deseja excluir esta unidade?")) {
            const { error } = await supabase.from('unidades').delete().eq('id', id);
            if (error) {
                console.error("Erro ao excluir unidade:", error);
                alert("Falha ao excluir a unidade.");
            } else {
                setUnidades(prev => prev.filter(un => un.id !== id));
            }
        }
    };

    // --- Modal Control ---
    const openModal = (type: 'insumo' | 'categoria' | 'unidade', data: Insumo | Categoria | Unidade | null = null) => {
        setInsumoFormStateCache(null);
        if (type === 'insumo') {
            setEditingInsumo(data as Insumo | null);
            setModalContent('insumo');
        } else if (type === 'categoria') {
            setEditingCategoria(data as Categoria | null);
            setModalContent('categoria');
        } else {
            setEditingUnidade(data as Unidade | null);
            setModalContent('unidade');
        }
    };

    const closeModal = () => {
        setModalContent(null);
        setEditingInsumo(null);
        setEditingCategoria(null);
        setEditingUnidade(null);
        setInsumoFormStateCache(null);
    };

    const handleCancelSubForm = () => {
        if (insumoFormStateCache) {
            setEditingInsumo(insumoFormStateCache);
            setInsumoFormStateCache(null);
            setModalContent('insumo');
        } else {
            closeModal();
        }
    };
    
    const handleRequestAddCategory = (currentItemState: Insumo | InsumoParaAdicionar) => {
        setInsumoFormStateCache(currentItemState);
        setEditingCategoria(null);
        setModalContent('categoria');
    };
    
    const handleRequestAddUnidade = (currentItemState: Insumo | InsumoParaAdicionar) => {
        setInsumoFormStateCache(currentItemState);
        setEditingUnidade(null);
        setModalContent('unidade');
    };

    const handleInsumoSubmit = (itemData: InsumoParaAdicionar | Insumo) => {
        if ('id' in itemData && itemData.id) {
            handleUpdateInsumo(itemData as Insumo);
        } else {
            handleAddInsumo(itemData as InsumoParaAdicionar);
        }
    };
    
    const handleCategoriaSubmit = (name: string) => {
        if (editingCategoria) {
            handleUpdateCategoria(editingCategoria.id, name);
        } else {
            handleAddCategoria(name);
        }
    };
    
     const handleUnidadeSubmit = (name: string) => {
        if (editingUnidade) {
            handleUpdateUnidade(editingUnidade.id, name);
        } else {
            handleAddUnidade(name);
        }
    };
    
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data inválida';
            return new Intl.DateTimeFormat('pt-BR').format(date);
        } catch (e) {
            return dateString; // fallback
        }
    };

    const renderTable = (
        columns: { key: string, label: string }[], 
        data: any[], 
        renderRow: (item: any) => React.ReactNode
    ) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {isLoading && <tr><td colSpan={columns.length + 1} className="text-center py-8 text-gray-500 dark:text-slate-400">Carregando...</td></tr>}
                        {error && <tr><td colSpan={columns.length + 1} className="text-center py-8 text-red-500 dark:text-red-400">{error}</td></tr>}
                        {!isLoading && !error && data.length === 0 && <tr><td colSpan={columns.length + 1} className="text-center py-8 text-gray-500 dark:text-slate-400">Nenhum item encontrado.</td></tr>}
                        {!isLoading && !error && data.map(renderRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Gerenciamento de Insumos</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Adicione, edite e visualize os insumos, categorias e unidades do seu estoque.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 shadow-sm"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 w-5 h-5"/>
                    </div>
                    <button onClick={() => openModal(activeTab === 'insumos' ? 'insumo' : activeTab === 'categorias' ? 'categoria' : 'unidade')} className="flex items-center justify-center gap-2 bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-sm whitespace-nowrap">
                        <PlusIcon className="w-5 h-5" />
                        {activeTab === 'insumos' ? 'Adicionar Insumo' : activeTab === 'categorias' ? 'Nova Categoria' : 'Nova Unidade'}
                    </button>
                </div>
            </div>

            <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('insumos')} className={`${activeTab === 'insumos' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Insumos</button>
                    <button onClick={() => setActiveTab('categorias')} className={`${activeTab === 'categorias' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Categorias</button>
                    <button onClick={() => setActiveTab('unidades')} className={`${activeTab === 'unidades' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>Unidades de Medida</button>
                </nav>
            </div>
            
            {activeTab === 'insumos' && renderTable(
                [{key: 'nome', label: 'Nome'}, {key: 'categoria', label: 'Categoria'}, {key: 'unidade', label: 'Unidade'}, {key: 'data', label: 'Data de Adição'}],
                filteredInsumos,
                (item: Insumo) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900 dark:text-slate-100">{item.nome}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">{item.categoria}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{item.unidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{formatDate(item.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-4">
                                <button onClick={() => openModal('insumo', item)} className="text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"><EditIcon /></button>
                                <button onClick={() => handleDeleteInsumo(item.id)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"><DeleteIcon /></button>
                            </div>
                        </td>
                    </tr>
                )
            )}

            {activeTab === 'categorias' && renderTable(
                [{key: 'nome', label: 'Nome da Categoria'}, {key: 'data', label: 'Data de Criação'}],
                filteredCategorias,
                (cat: Categoria) => (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-slate-100">{cat.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{formatDate(cat.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-4">
                                <button onClick={() => openModal('categoria', cat)} className="text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"><EditIcon /></button>
                                <button onClick={() => handleDeleteCategoria(cat.id)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"><DeleteIcon /></button>
                            </div>
                        </td>
                    </tr>
                )
            )}
            
            {activeTab === 'unidades' && renderTable(
                 [{key: 'nome', label: 'Nome da Unidade'}, {key: 'data', label: 'Data de Criação'}],
                 filteredUnidades,
                 (un: Unidade) => (
                    <tr key={un.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-slate-100">{un.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{formatDate(un.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-4">
                                <button onClick={() => openModal('unidade', un)} className="text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors"><EditIcon /></button>
                                <button onClick={() => handleDeleteUnidade(un.id)} className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors"><DeleteIcon /></button>
                            </div>
                        </td>
                    </tr>
                 )
            )}


            <Modal
                isOpen={!!modalContent}
                onClose={closeModal}
                title={
                    modalContent === 'insumo'
                        ? (editingInsumo && 'id' in editingInsumo ? 'Editar Insumo' : 'Adicionar Novo Insumo')
                        : modalContent === 'categoria'
                            ? (editingCategoria ? 'Editar Categoria' : 'Adicionar Nova Categoria')
                            : (editingUnidade ? 'Editar Unidade' : 'Adicionar Nova Unidade')
                }
            >
                {modalContent === 'insumo' ? (
                    <ItemForm
                        onSubmit={handleInsumoSubmit}
                        onCancel={closeModal}
                        initialData={editingInsumo}
                        categorias={categorias}
                        unidades={unidades}
                        onRequestAddCategory={handleRequestAddCategory}
                        onRequestAddUnidade={handleRequestAddUnidade}
                    />
                ) : modalContent === 'categoria' ? (
                    <NameEntityForm 
                        onSubmit={handleCategoriaSubmit}
                        onCancel={handleCancelSubForm}
                        initialData={editingCategoria}
                        entityName="Categoria"
                    />
                ) : modalContent === 'unidade' ? (
                    <NameEntityForm
                        onSubmit={handleUnidadeSubmit}
                        onCancel={handleCancelSubForm}
                        initialData={editingUnidade}
                        entityName="Unidade"
                    />
                ): null}
            </Modal>
        </div>
    );
};