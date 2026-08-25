import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Calendar, 
  Home, 
  Camera, 
  Users, 
  RotateCcw,
  Sparkles,
  Check,
  UserCheck
} from 'lucide-react';
import { ActiveScreen, Family, FamilyMember } from '../types';

interface NavbarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  families: Family[];
  activeFamilyId: string;
  onSelectFamily: (familyId: string) => void;
  onOpenNewFamilyModal: () => void;
  onResetDemo: () => void;
  onSwitchMember: (memberId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  families,
  activeFamilyId,
  onSelectFamily,
  onOpenNewFamilyModal,
  onResetDemo,
  onSwitchMember,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  const activeFamily = families.find((f) => f.id === activeFamilyId) || families[0];
  const currentMember = activeFamily?.members.find((m) => m.isCurrentUser) || activeFamily?.members[0];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setMemberDropdownOpen(false);
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
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setMemberDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8FF] hover:bg-[#ebedff] border border-[#287BFF]/20 text-[#15172A] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
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
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs sm:text-sm transition-colors cursor-pointer ${
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
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#FF2EB5] hover:bg-[#FF2EB5]/5 flex items-center gap-2 transition-colors cursor-pointer"
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
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

          {/* Actions & Interactive Persona Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop "Crear encuentro" CTA */}
            <button
              id="desktop-create-meeting-btn"
              onClick={() => onNavigate('create_meeting')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear encuentro</span>
            </button>

            {/* Interactive Demo Persona Switcher */}
            {currentMember && activeFamily && (
              <div className="relative" ref={memberDropdownRef}>
                <button 
                  id="user-badge"
                  onClick={() => {
                    setMemberDropdownOpen(!memberDropdownOpen);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#FF2EB5]/25 bg-[#FF2EB5]/5 hover:bg-[#FF2EB5]/10 text-left transition-all cursor-pointer group"
                  title="Cambiar integrante para probar la demo"
                  aria-expanded={memberDropdownOpen}
                >
                  <div 
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
                    style={{ backgroundColor: currentMember.avatarColor || '#FF2EB5' }}
                  >
                    {currentMember.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-[#15172A] leading-tight group-hover:text-[#FF2EB5] transition-colors truncate max-w-[90px] lg:max-w-[120px]">
                        {currentMember.name}
                      </p>
                      <span className="text-[10px] text-[#FF2EB5] font-semibold bg-[#FF2EB5]/15 px-1 rounded">
                        Demo
                      </span>
                    </div>
                    <p className="text-[10px] text-[#62677F] truncate max-w-[90px] lg:max-w-[120px]">
                      {currentMember.relation || (currentMember.role === 'admin' ? 'Admin' : 'Integrante')}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#62677F] transition-transform ${memberDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Member Dropdown Menu */}
                {memberDropdownOpen && (
                  <div 
                    id="member-selector-dropdown"
                    className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-3 bg-gradient-to-r from-[#FF2EB5]/10 to-[#8B5CFF]/10 rounded-xl mb-2 border border-[#FF2EB5]/15">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#15172A]">
                        <UserCheck className="w-4 h-4 text-[#FF2EB5]" />
                        <span>Probar como otro integrante</span>
                      </div>
                      <p className="text-[11px] text-[#62677F] mt-1 leading-relaxed">
                        Seleccioná un integrante de la <strong>{activeFamily.name}</strong> para ver y probar la app desde su perspectiva (votar, sugerir fechas/lugares, asumir tareas).
                      </p>
                    </div>

                    <div className="px-2 py-1 text-[10px] font-bold text-[#62677F] uppercase tracking-wider">
                      Integrantes de {activeFamily.name}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                      {activeFamily.members.map((member) => {
                        const isSelected = member.id === currentMember.id;
                        return (
                          <button
                            key={member.id}
                            onClick={() => {
                              onSwitchMember(member.id);
                              setMemberDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FF2EB5]/10 border border-[#FF2EB5]/30 text-[#15172A]'
                                : 'hover:bg-gray-50 border border-transparent text-[#15172A]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                                style={{ backgroundColor: member.avatarColor || '#287BFF' }}
                              >
                                {member.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold truncate">{member.name}</p>
                                  {member.role === 'admin' && (
                                    <span className="text-[9px] font-semibold bg-[#FF2EB5]/15 text-[#FF2EB5] px-1.5 py-0.2 rounded">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#62677F] truncate">
                                  {member.relation || 'Integrante'}
                                </p>
                              </div>
                            </div>

                            {isSelected ? (
                              <span className="text-[10px] font-bold bg-[#FF2EB5] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <Check className="w-3 h-3" /> Activo
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#62677F] group-hover:text-[#287BFF] shrink-0">
                                Probar →
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reset Demo button */}
            <button
              id="reset-demo-btn"
              onClick={onResetDemo}
              title="Reiniciar datos de la demo a los iniciales"
              className="p-2 text-[#62677F] hover:text-[#15172A] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
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
