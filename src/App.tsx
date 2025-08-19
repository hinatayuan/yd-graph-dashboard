import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SepoliaTransactions from './components/SepoliaTransactions';
import { BarChart3, Search } from 'lucide-react';

const NavButton: React.FC<{ to: string; children: React.ReactNode; icon: React.ReactNode }> = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </Link>
  );
};

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 mr-8">
              YD Dashboard
            </h1>
            
            <div className="flex space-x-4">
              <NavButton to="/" icon={<BarChart3 className="h-4 w-4" />}>
                BNB 数据面板
              </NavButton>
              <NavButton to="/sepolia" icon={<Search className="h-4 w-4" />}>
                Sepolia 转账查询
              </NavButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sepolia" element={<SepoliaTransactions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;