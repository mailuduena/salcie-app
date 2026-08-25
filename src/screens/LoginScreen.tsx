import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/ToastContext';

interface LoginScreenProps {
  onEnterDemo: () => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onEnterDemo, onBack }) => {
  const [email, setEmail] = useState('mai@familia.com');
  const [password, setPassword] = useState('••••••••');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const { showToast } = useToast();

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Ingresando con cuenta simulada de demostración...');
    onEnterDemo();
  };

  return (
    <div 
      id="login-screen" 
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#F7F8FF] via-white to-[#F0F3FF] px-4 sm:px-6 relative overflow-hidden py-12"
    >
      {/* Background accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-[#FF2EB5]/8 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-[#287BFF]/8 blur-[90px] pointer-events-none" />

      {/* Back to Welcome */}
      <button
        id="back-to-welcome-btn"
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#62677F] hover:text-[#15172A] p-2 rounded-xl hover:bg-white/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-xl border border-[#287BFF]/15 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-7">
          <span className="text-3xl font-extrabold tracking-tight font-brand text-[#15172A]">
            Sal<span className="text-[#FF2EB5]">Cie</span>
          </span>
          <h2 className="text-xl font-bold text-[#15172A] mt-2">
            {isRegisterMode ? 'Crear cuenta familiar' : 'Acceso al espacio familiar'}
          </h2>
          <p className="text-xs text-[#62677F] mt-1">
            {isRegisterMode ? 'Regístrate para comenzar a organizar tus encuentros' : 'Ingresa para acceder a tus grupos y recuerdos'}
          </p>
        </div>

        {/* Demo Fast Access Highlight */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#287BFF]/8 via-[#8B5CFF]/8 to-[#FF2EB5]/8 border border-[#287BFF]/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#287BFF] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modo Demostración</span>
          </div>
          <p className="text-xs text-[#62677F] mb-3">
            Explora todas las funciones con familias y encuentros ficticios precargados.
          </p>
          <button
            id="login-demo-direct-btn"
            type="button"
            onClick={onEnterDemo}
            className="w-full py-2.5 px-4 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <span>Entrar a la demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-medium text-[#62677F] uppercase tracking-wider">o ingresar simulado</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSimulatedSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email-input" className="block text-xs font-bold text-[#15172A] mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#62677F] absolute left-3.5 top-3" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@familia.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password-input" className="block text-xs font-bold text-[#15172A] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#62677F] absolute left-3.5 top-3" />
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF] transition-colors"
                required
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full py-3 rounded-xl bg-[#15172A] text-white text-sm font-bold hover:bg-[#232742] transition-colors shadow-sm"
          >
            {isRegisterMode ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-6 text-center">
          <button
            id="toggle-register-link"
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs font-semibold text-[#287BFF] hover:text-[#1a6beb] transition-colors"
          >
            {isRegisterMode 
              ? '¿Ya tienes un espacio familiar? Ingresar' 
              : '¿Primera vez en SalCie? Crear cuenta'}
          </button>
        </div>

      </motion.div>
    </div>
  );
};
