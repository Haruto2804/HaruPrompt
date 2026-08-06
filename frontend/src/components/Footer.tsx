import React from 'react';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-black/50 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-zinc-400 text-sm">
          &copy; {new Date().getFullYear()} HaruPrompt. All rights reserved.
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <a 
            href="mailto:ngobao.software@gmail.com" 
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Mail size={18} />
            <span className="text-sm">ngobao.software@gmail.com</span>
          </a>
          
          <a 
            href="https://www.facebook.com/baodaydunglo/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-[#1877F2] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            <span className="text-sm">Facebook Cá Nhân</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
