import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Calendar, 
  Home, 
  Camera, 
  Users, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ActiveScreen, Family } from '../types';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  families: Family[];
  activeFamilyId: string;
  onSelectFamily: (familyId: string) => void;
  onOpenNewFamilyModal: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  families,
  activeFamilyId,
  onSelectFamily,
  onOpenNewFamilyModal,
  onResetDemo,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeFamily = families.find((f) => f.id === activeFamilyId) || families[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ActiveScreen; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'meetings', label: 'Encuentros', icon: Calendar },
    { id: 'memories', label: 'Recuerdos', icon: Camera },
    { id: 'family_members', label: 'Familia', icon: Users },
  ];

  return (
    <header 
      id="main-navbar" 
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#287BFF]/10 transition-all shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand & Family Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate('home')}
              className="flex items-baseline focus:outline-none group text-left"
              aria-label="Ir al inicio de SalCie"
            >
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-brand text-[#15172A] group-hover:opacity-90 transition-opacity">
                Sal<span className="text-[#FF2EB5]">Cie</span>
              </span>
            </button>

            {/* Separator */}
            <div className="hidden sm:block h-6 w-px bg-gray-200" />

            {/* Family Switcher Dropdown */}
            {activeFamily && (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="family-selector-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8FF] hover:bg-[#ebedff] border border-[#287BFF]/20 text-[#15172A] text-xs sm:text-sm font-semibold transition-all"
                  aria-expanded={dropdownOpen}
                  aria-label="Cambiar de espacio familiar"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF2EB5] animate-pulse" />
                  <span className="max-w-[120px] sm:max-w-[180px] truncate">{activeFamily.name}</span>
                  <ChevronDown className={`w-4 h-4 text-[#62677F] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div 
                    id="family-selector-dropdown"
                    className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#62677F] uppercase tracking-wider">
                      Espacios familiares
                    </div>

                    {families.map((fam) => (
                      <button
                        key={fam.id}
                        onClick={() => {
                          onSelectFamily(fam.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs sm:text-sm transition-colors ${
                          fam.id === activeFamilyId
                            ? 'bg-[#287BFF]/10 text-[#287BFF] font-bold'
                            : 'text-[#15172A] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img src={fam.coverUrl} alt={fam.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate">{fam.name}</span>
                        </div>
                        {fam.id === activeFamilyId && (
                          <span className="text-[10px] font-bold bg-[#287BFF] text-white px-2 py-0.5 rounded-full">
                            Activo
                          </span>
                        )}
                      </button>
                    ))}

                    <div className="my-1 border-t border-gray-100" />

                    <button
                      id="dropdown-create-family-btn"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenNewFamilyModal();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#FF2EB5] hover:bg-[#FF2EB5]/5 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Crear nueva familia
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-[#287BFF] bg-[#287BFF]/10'
                      : 'text-[#62677F] hover:text-[#15172A] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop "Crear encuentro" CTA */}
            <button
              id="desktop-create-meeting-btn"
              onClick={() => onNavigate('create_meeting')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-102 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Crear encuentro</span>
            </button>

            {/* Current user badge "Mai" */}
            <div 
              id="user-badge"
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF2EB5] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                M
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[#15172A] leading-tight">Mai</p>
                <p className="text-[10px] text-[#62677F]">Admin</p>
              </div>
            </div>

            {/* Reset Demo button */}
            <button
              id="reset-demo-btn"
              onClick={onResetDemo}
              title="Reiniciar datos de la demo a los iniciales"
              className="p-2 text-[#62677F] hover:text-[#15172A] hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Reiniciar demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
