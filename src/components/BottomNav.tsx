import React from 'react';
import { Home, Calendar, Plus, Camera, Users } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <div 
      id="mobile-bottom-nav" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#287BFF]/15 px-3 py-2 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Inicio */}
        <button
          id="mobile-nav-home"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            currentScreen === 'home' ? 'text-[#287BFF]' : 'text-[#62677F] hover:text-[#15172A]'
          }`}
          aria-label="Inicio"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Inicio</span>
        </button>

        {/* Encuentros */}
        <button
          id="mobile-nav-meetings"
          onClick={() => onNavigate('meetings')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            currentScreen === 'meetings' || currentScreen === 'meeting_detail' 
              ? 'text-[#287BFF]' 
              : 'text-[#62677F] hover:text-[#15172A]'
          }`}
          aria-label="Encuentros"
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Encuentros</span>
        </button>

        {/* Crear (Center Highlighted Button) */}
        <button
          id="mobile-nav-create"
          onClick={() => onNavigate('create_meeting')}
          className="flex flex-col items-center justify-center -mt-5 group"
          aria-label="Crear nuevo encuentro"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#FF2EB5] via-[#8B5CFF] to-[#287BFF] text-white flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#FF2EB5] mt-1">Crear</span>
        </button>

        {/* Recuerdos */}
        <button
          id="mobile-nav-memories"
          onClick={() => onNavigate('memories')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            currentScreen === 'memories' ? 'text-[#287BFF]' : 'text-[#62677F] hover:text-[#15172A]'
          }`}
          aria-label="Recuerdos"
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Recuerdos</span>
        </button>

        {/* Familia */}
        <button
          id="mobile-nav-family"
          onClick={() => onNavigate('family_members')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-colors ${
            currentScreen === 'family_members' || currentScreen === 'families' 
              ? 'text-[#287BFF]' 
              : 'text-[#62677F] hover:text-[#15172A]'
          }`}
          aria-label="Familia"
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Familia</span>
        </button>
      </div>
    </div>
  );
};
