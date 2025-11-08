import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { InsumosPage } from './pages/InsumosPage';
import { PedidosPage } from './pages/PedidosPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState('Dashboard');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


    const renderContent = () => {
        switch (activePage) {
            case 'Dashboard':
                return <DashboardPage setActivePage={setActivePage} />;
            case 'Insumos':
                return <InsumosPage />;
            case 'Pedidos':
                return <PedidosPage />;
            case 'Relatórios':
            case 'Usuários':
            case 'Solicitações':
            case 'Financeiro':
                return <PlaceholderPage title={activePage} />;
            default:
                return <DashboardPage setActivePage={setActivePage} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-gray-800 dark:text-slate-200 font-sans overflow-x-hidden">
            {/* Backdrop para menu mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                ></div>
            )}

            <Sidebar 
                activePage={activePage} 
                setActivePage={setActivePage}
                isExpanded={isSidebarExpanded}
                setExpanded={setIsSidebarExpanded}
                isMobileOpen={isMobileMenuOpen}
                setMobileOpen={setIsMobileMenuOpen}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;