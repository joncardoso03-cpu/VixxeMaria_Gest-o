import React from 'react';
import { 
    HomeIcon, 
    ChartBarIcon, 
    UsersIcon, 
    CubeIcon, 
    DocumentCheckIcon, 
    ShoppingCartIcon, 
    CurrencyDollarIcon,
    ArrowRightOnRectangleIcon,
} from './Icons';

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    isExpanded: boolean;
    setExpanded: (expanded: boolean) => void;
    isMobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const navItems = [
    { name: 'Dashboard', icon: HomeIcon },
    { name: 'Relatórios', icon: ChartBarIcon },
    { name: 'Usuários', icon: UsersIcon },
    { name: 'Insumos', icon: CubeIcon },
    { name: 'Solicitações', icon: DocumentCheckIcon },
    { name: 'Pedidos', icon: ShoppingCartIcon },
    { name: 'Financeiro', icon: CurrencyDollarIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isExpanded, setExpanded, isMobileOpen, setMobileOpen }) => {
    
    const handleNavClick = (page: string) => {
        setActivePage(page);
        if (isMobileOpen) {
            setMobileOpen(false);
        }
    };

    return (
        <aside 
            className={`
                fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 
                flex-col flex border-r border-gray-200 dark:border-slate-800
                transition-all duration-300 ease-in-out
                lg:relative lg:inset-auto lg:translate-x-0 
                ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                ${isExpanded ? 'w-64' : 'lg:w-20'}
            `}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <div className={`h-20 flex items-center border-b border-gray-200 dark:border-slate-800 shrink-0 ${isExpanded ? 'justify-center' : 'justify-center'}`}>
                 <h1 className={`text-xl font-bold text-orange-600 transition-opacity duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>LogoMarca</h1>
                  <CubeIcon className={`text-orange-600 transition-opacity duration-200 ${!isExpanded ? 'opacity-100 h-8 w-8' : 'opacity-0 h-0 w-0'}`} />
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = activePage === item.name;
                    return (
                        <a
                            key={item.name}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.name);
                            }}
                            title={isExpanded ? '' : item.name}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors relative
                                ${isActive 
                                    ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400' 
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
                                }
                            `}
                        >
                            {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full ${!isExpanded && 'hidden'}`}></div>}
                            <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400 dark:text-slate-500'} ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                            <span className={`transition-opacity whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>{item.name}</span>
                        </a>
                    )
                })}
            </nav>

            <div className='px-4 py-6 border-t border-gray-200 dark:border-slate-800 space-y-2'>
                 <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    title={isExpanded ? '' : 'Sair'}
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200"
                >
                    <ArrowRightOnRectangleIcon className={`w-5 h-5 shrink-0 text-gray-400 dark:text-slate-500 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
                    <span className={`transition-opacity whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>Sair</span>
                </a>
            </div>
        </aside>
    );
};