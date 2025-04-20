import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/jury', label: 'Jury' },
    { path: '/scores', label: 'Scores' },
    { path: '/top-bands', label: 'Top 10' },
    { path: '/manage-jury', label: 'Beheer Jury' },
    { path: '/manage-bands', label: 'Beheer Bands' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/jury') return location.pathname.includes('/jury');
    return location.pathname === path;
  };

  return (
    <header className="bg-[#004380] text-white shadow-md relative z-20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigate('/')} role="button">
            <h1 className="text-xl font-bold">Bemmelse Dweildag</h1>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            {navLinks.map(link => (
              <button 
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`${isActive(link.path) ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors px-2 py-1 rounded`}
              >
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-1 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      <div 
        className={`absolute top-full left-0 right-0 bg-[#003366] shadow-lg md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 border-t border-blue-700' : 'max-h-0 opacity-0' 
        }`}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map(link => (
            <button 
              key={`mobile-${link.path}`}
              onClick={() => handleNavigate(link.path)}
              className={`w-full text-left px-3 py-2 rounded ${
                isActive(link.path) 
                ? 'bg-orange-500 text-white font-semibold' 
                : 'text-white hover:bg-[#004380]'
              } transition-colors`}
            >
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;