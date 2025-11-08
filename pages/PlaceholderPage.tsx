import React from 'react';

interface PlaceholderPageProps {
    title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">{title}</h1>
            <p className="mt-2 text-gray-500 dark:text-slate-400">Esta página está em construção.</p>
        </div>
    );
};