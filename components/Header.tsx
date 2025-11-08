import React, { useContext } from 'react';
import { SunIcon, BellIcon, MoonIcon, MenuIcon } from './Icons';
import { ThemeContext } from '../contexts/ThemeContext';

interface HeaderProps {
    onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 shrink-0">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button 
            onClick={onMobileMenuToggle} 
            className="lg:hidden p-2 -ml-2 mr-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
              Painel Administrativo
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Bem-vindo, Jonathan Cardoso</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
            ) : (
                <SunIcon className="w-6 h-6" />
            )}
          </button>
          <button 
            className="relative p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Notificações"
          >
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};