import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-[#004380] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center" onClick={() => navigate('/')} role="button">
            <h1 className="text-xl font-bold">Bemmelse Dweildag</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => navigate('/')}
              className={`${location.pathname === '/' ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors`}
            >
              <span>Home</span>
            </button>
            <button 
              onClick={() => navigate('/jury')}
              className={`${location.pathname.includes('/jury') ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors`}
            >
              <span>Jury</span>
            </button>
            <button 
              onClick={() => navigate('/scores')}
              className={`${location.pathname === '/scores' ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors`}
            >
              <span>Scores</span>
            </button>
          </nav>
          
          <div className="flex md:hidden">
            <button className="mobile-menu-button">
              MENU
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu at bottom of screen */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#004380] shadow-lg z-10">
        <div className="flex justify-around items-center py-2">
          <button 
            onClick={() => navigate('/')}
            className={`flex flex-col items-center px-4 py-2 ${location.pathname === '/' ? 'text-orange-300' : 'text-white'}`}
          >
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => navigate('/jury')}
            className={`flex flex-col items-center px-4 py-2 ${location.pathname.includes('/jury') ? 'text-orange-300' : 'text-white'}`}
          >
            <span className="text-xs mt-1">Jury</span>
          </button>
          <button 
            onClick={() => navigate('/scores')}
            className={`flex flex-col items-center px-4 py-2 ${location.pathname === '/scores' ? 'text-orange-300' : 'text-white'}`}
          >
            <span className="text-xs mt-1">Scores</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;