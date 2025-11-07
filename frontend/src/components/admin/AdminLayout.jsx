import React from 'react';
import { Sidebar } from './Sidebar';

export const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};