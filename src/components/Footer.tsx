import React from 'react';
import { Music } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#003366] text-white py-3 text-center text-sm mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-1 mb-1">
          <p>Bemmelse Dweildag {new Date().getFullYear()}</p>
        </div>
        <p>Scoringsapp gemaakt voor jurybeoordeling</p>
      </div>
    </footer>
  );
};

export default Footer;