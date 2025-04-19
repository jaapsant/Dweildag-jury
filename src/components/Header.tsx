import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Award, Home } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-[#004380] text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center" onClick={() => navigate('/')} role="button">
            <Music size={28} className="mr-2" />
            <h1 className="text-xl font-bold">Bemmelse Dweildag</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => navigate('/')}
              className={`flex items-center ${location.pathname === '/' ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors`}
            >
              <Home size={18} className="mr-1" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => navigate('/jury')}
              className={`flex items-center ${location.pathname.includes('/jury') ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors`}
            >
              <Music size={18} className="mr-1" />
              <span>Jury</span>
            </button>
            <button 
              onClick={() => navigate('/scores')}
              className={`flex items-center ${location.pathname === '/scores' ? 'text-orange-300 font-semibold' : 'text-white'} hover:text-orange-200 transition-colors`}
            >
              <Award size={18} className="mr-1" />
              <span>Scores</span>
            </button>
          </nav>
          
          <div className="flex md:hidden">
            <button className="mobile-menu-button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
            <Home size={22} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => navigate('/jury')}
            className={`flex flex-col items-center px-4 py-2 ${location.pathname.includes('/jury') ? 'text-orange-300' : 'text-white'}`}
          >
            <Music size={22} />
            <span className="text-xs mt-1">Jury</span>
          </button>
          <button 
            onClick={() => navigate('/scores')}
            className={`flex flex-col items-center px-4 py-2 ${location.pathname === '/scores' ? 'text-orange-300' : 'text-white'}`}
          >
            <Award size={22} />
            <span className="text-xs mt-1">Scores</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;