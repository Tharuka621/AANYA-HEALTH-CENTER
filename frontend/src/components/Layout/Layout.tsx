import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-20 p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;