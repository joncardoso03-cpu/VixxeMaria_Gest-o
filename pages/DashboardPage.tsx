import React, { useState, useEffect } from 'react';
import { 
    ArrowTrendingUpIcon, 
    CalendarIcon, 
    ChartBarIcon, 
    UsersIcon, 
    CubeIcon, 
    DocumentCheckIcon, 
    ShoppingCartIcon, 
    CurrencyDollarIcon 
} from '../components/Icons';
import { supabase } from '../services/supabase';


interface DashboardCardProps {
    title: string;
    description: string;
    value?: string | number;
    icon: React.ElementType;
    color: string;
    onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, value, icon: Icon, color, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border border-gray-200/50 dark:border-slate-700/50"
    >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mt-4 text-gray-800 dark:text-slate-100">{title}</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm">{description}</p>
        {value !== undefined && <p className="text-3xl font-bold mt-2 text-gray-700 dark:text-slate-200">{value}</p>}
    </div>
);

interface DashboardPageProps {
    setActivePage: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
    const [insumosCount, setInsumosCount] = useState<number | string>('...');

    useEffect(() => {
        const fetchStats = async () => {
            const { count, error } = await supabase
                .from('insumos')
                .select('*', { count: 'exact', head: true });

            if (!error && count !== null) {
                setInsumosCount(count);
            } else {
                console.error("Erro ao buscar contagem de insumos", error);
                setInsumosCount(0);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { title: 'Relatórios', description: 'Análises e métricas', icon: ChartBarIcon, color: 'bg-blue-500', page: 'Relatórios' },
        { title: 'Usuários', description: 'Gerenciar usuários', value: 4, icon: UsersIcon, color: 'bg-green-500', page: 'Usuários' },
        { title: 'Insumos', description: 'Catálogo de produtos', value: insumosCount, icon: CubeIcon, color: 'bg-orange-500', page: 'Insumos' },
        { title: 'Solicitações', description: 'Novos itens solicitados', value: 0, icon: DocumentCheckIcon, color: 'bg-purple-500', page: 'Solicitações' },
        { title: 'Pedidos', description: 'Gestão de pedidos', value: 40, icon: ShoppingCartIcon, color: 'bg-teal-500', page: 'Pedidos' },
        { title: 'Financeiro', description: 'Gestão financeira', icon: CurrencyDollarIcon, color: 'bg-yellow-500', page: 'Financeiro' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 p-6 rounded-xl shadow-lg w-full max-w-sm">
                <div className="flex justify-between items-center text-orange-100">
                    <p className="font-medium">Valor Total</p>
                    <ArrowTrendingUpIcon />
                </div>
                <p className="text-4xl font-bold text-white my-2">R$ 6.564,70</p>
                <div className="flex items-center text-sm text-orange-200 hover:text-white cursor-pointer transition-colors">
                    <p>01/10 - 31/10/2025 - Clique para alterar</p>
                    <CalendarIcon className="ml-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <DashboardCard 
                        key={card.title}
                        title={card.title}
                        description={card.description}
                        value={card.value}
                        icon={card.icon}
                        color={card.color}
                        onClick={() => setActivePage(card.page)}
                    />
                ))}
            </div>
        </div>
    );
};