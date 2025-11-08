import React, { useState, useMemo, useEffect } from 'react';
import type { Insumo } from '../types';
import { SearchIcon, CubeIcon, ChevronDownIcon, PlusIcon, MinusIcon, ShoppingCartIcon, DocumentDownloadIcon } from '../components/Icons';
import { supabase } from '../services/supabase';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const QuantityStepper: React.FC<{
    value: number;
    onChange: (newValue: number) => void;
}> = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
        <button 
            onClick={() => onChange(Math.max(0, value - 1))} 
            disabled={value === 0}
            className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
            aria-label="Diminuir quantidade"
        >
            <MinusIcon className="w-4 h-4"/>
        </button>
        <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} 
            className="w-14 text-center font-bold border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
        <button 
            onClick={() => onChange(value + 1)} 
            className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Aumentar quantidade"
        >
            <PlusIcon className="w-4 h-4"/>
        </button>
    </div>
);

export const PedidosPage: React.FC = () => {
    const [insumosDB, setInsumosDB] = useState<Insumo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [cart, setCart] = useState<Map<string, { item: Insumo; quantity: number }>>(new Map());

    useEffect(() => {
        const fetchInsumos = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('insumos').select('*').order('nome', { ascending: true });
            if (!error && data) {
                setInsumosDB(data);
            } else {
                console.error("Erro ao buscar insumos para pedidos:", error);
            }
            setIsLoading(false);
        };
        fetchInsumos();
    }, []);

    const groupedAndFilteredInsumos = useMemo<{ [key: string]: Insumo[] }>(() => {
        const grouped: { [key: string]: Insumo[] } = {};
        
        insumosDB.forEach(insumo => {
            if (insumo.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
                if (!grouped[insumo.categoria]) {
                    grouped[insumo.categoria] = [];
                }
                grouped[insumo.categoria].push(insumo);
            }
        });

        return grouped;
    }, [searchTerm, insumosDB]);

    const { cartItems, cartTotal, totalItemsInCart } = useMemo(() => {
        const cartItems = Array.from(cart.values());
        const cartTotal = cartItems.reduce((sum: number, { item, quantity }) => sum + item.preco * quantity, 0);
        const totalItemsInCart = cartItems.reduce((sum: number, { quantity }) => sum + quantity, 0);
        return { cartItems, cartTotal, totalItemsInCart };
    }, [cart]);

    const handleToggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const handleQuantityChange = (item: Insumo, quantity: number) => {
        setCart(prev => {
            const newCart = new Map(prev);
            if (quantity > 0) {
                newCart.set(item.id, { item, quantity });
            } else {
                newCart.delete(item.id);
            }
            return newCart;
        });
    };
    
    const renderCart = () => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200/80 dark:border-slate-700/50 p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-slate-100">Seu Pedido</h2>
            {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500">
                    <ShoppingCartIcon className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                    <p className="font-medium">Seu carrinho está vazio</p>
                    <p className="text-sm">Adicione itens da lista para começar.</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-4">
                        {cartItems.map(({ item, quantity }) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-slate-200">{item.nome}</p>
                                    <p className="text-gray-500 dark:text-slate-400">{quantity} x {formatCurrency(item.preco)}</p>
                                </div>
                                <p className="font-bold text-gray-800 dark:text-slate-100">{formatCurrency(item.preco * quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4 space-y-3">
                        <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-slate-100">
                            <span>Total</span>
                            <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <button className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <ShoppingCartIcon className="w-5 h-5"/>
                            Confirmar Pedido
                        </button>
                        <button className="w-full bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 font-bold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                           <DocumentDownloadIcon className="w-5 h-5"/>
                           Gerar PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
    
    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 relative lg:pb-0">
            {/* Main Content (Items List) */}
            <div className="lg:col-span-2 space-y-4 pb-48 lg:pb-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar insumo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg py-3 pl-12 pr-4 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon className="text-gray-400 dark:text-slate-400 w-6 h-6"/>
                    </div>
                </div>

                {isLoading && (
                     <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                        Carregando insumos...
                    </div>
                )}

                {!isLoading && Object.keys(groupedAndFilteredInsumos).length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        Nenhum insumo encontrado para "{searchTerm}".
                    </div>
                )}
                
                {!isLoading && Object.keys(groupedAndFilteredInsumos).map((categoria) => {
                    const insumos = groupedAndFilteredInsumos[categoria];
                    const isExpanded = expandedCategories.has(categoria);
                    const itemsInCartInCategory = insumos.filter(i => cart.has(i.id)).length;
                    
                    return (
                        <div key={categoria} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-slate-700/50 overflow-hidden">
                            <button
                                onClick={() => handleToggleCategory(categoria)}
                                className={`w-full flex items-center justify-between p-4 text-left transition-colors ${itemsInCartInCategory > 0 ? 'bg-green-50 dark:bg-green-500/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                            >
                                <div className="flex items-center">
                                    <CubeIcon className={`w-6 h-6 mr-3 ${itemsInCartInCategory > 0 ? 'text-green-600' : 'text-gray-400 dark:text-slate-400'}`} />
                                    <span className={`font-bold ${itemsInCartInCategory > 0 ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-slate-200'}`}>{categoria}</span>
                                    {itemsInCartInCategory > 0 && <span className="ml-3 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemsInCartInCategory}</span>}
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 dark:text-slate-400 mr-4">{insumos.length} itens</span>
                                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700/50">
                                    <ul className="space-y-3">
                                        {insumos.map(item => {
                                            const cartEntry = cart.get(item.id);
                                            const quantityInCart = cartEntry?.quantity || 0;
                                            return (
                                                <li key={item.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg transition-colors ${quantityInCart > 0 ? 'bg-green-100/50 dark:bg-green-500/10' : 'bg-white dark:bg-slate-700/50'}`}>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-slate-200">{item.nome}</p>
                                                        <p className="text-sm text-gray-600 dark:text-slate-400">{formatCurrency(item.preco)} / {item.unidade}</p>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0">
                                                        <QuantityStepper value={quantityInCart} onChange={(q) => handleQuantityChange(item, q)} />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Desktop Cart */}
            <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-8">
                   {renderCart()}
                </div>
            </div>
            
            {/* Mobile Cart */}
            {totalItemsInCart > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.4)] z-40 rounded-t-2xl">
                    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-slate-700">
                        <span className="font-bold">Carrinho ({totalItemsInCart} {totalItemsInCart > 1 ? 'itens' : 'item'})</span>
                        <span className="font-bold text-lg">{formatCurrency(cartTotal)}</span>
                    </div>
                     <div className="p-4 grid grid-cols-2 gap-3">
                         <button className="w-full bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 font-bold py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                           <DocumentDownloadIcon className="w-5 h-5"/>
                           PDF
                        </button>
                        <button className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <ShoppingCartIcon className="w-5 h-5"/>
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};