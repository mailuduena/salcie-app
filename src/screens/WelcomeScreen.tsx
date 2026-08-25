import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Vote, Heart, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [showBenefits, setShowBenefits] = useState(false);

  return (
    <div 
      id="welcome-screen" 
      className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#F7F8FF] via-white to-[#F0F3FF] relative overflow-hidden"
    >
      {/* Background subtle ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-[#FF2EB5]/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-[#287BFF]/10 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="pt-8 px-6 max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-brand text-[#15172A]">
            Sal<span className="text-[#FF2EB5]">Cie</span>
          </span>
        </div>
        <button
          id="welcome-demo-top-btn"
          onClick={onEnter}
          className="text-xs sm:text-sm font-bold text-[#287BFF] hover:text-[#1a6beb] px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-[#287BFF]/20 shadow-xs transition-all"
        >
          Acceso rápido
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 max-w-3xl mx-auto z-10">
        
        {/* Brand Tagline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF2EB5]/10 border border-[#FF2EB5]/20 text-[#FF2EB5] text-xs sm:text-sm font-bold mb-6 shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>Espacio privado familiar</span>
        </motion.div>

        {/* Brand Wordmark & Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#15172A] tracking-tight leading-[1.15] mb-5 font-brand"
        >
          “Nos organizamos para encontrarnos.{' '}
          <span className="gradient-salcie-text">
            Guardamos lo vivido para siempre.”
          </span>
        </motion.h1>

        {/* Short Product Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-[#62677F] max-w-2xl leading-relaxed mb-10"
        >
          Un espacio privado para organizar encuentros familiares, decidir juntos y conservar los recuerdos de cada momento compartido.
        </motion.p>

        {/* Primary & Secondary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <button
            id="welcome-enter-btn"
            onClick={onEnter}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-salcie-btn text-base font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
          >
            <span>Entrar a mi familia</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            id="welcome-learn-more-btn"
            onClick={() => setShowBenefits(!showBenefits)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#287BFF]/25 hover:border-[#287BFF]/50 text-[#15172A] text-base font-semibold shadow-xs hover:bg-[#F7F8FF] transition-all flex items-center justify-center gap-2"
          >
            <span>Conocer SalCie</span>
            <ChevronDown className={`w-4 h-4 text-[#287BFF] transition-transform ${showBenefits ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>

        {/* 3 Core Benefits Panel */}
        <AnimatePresence>
          {showBenefits && (
            <motion.div
              id="salcie-benefits-section"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 36 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden w-full text-left"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                
                {/* Benefit 1 */}
                <div className="p-5 rounded-2xl bg-white border border-[#287BFF]/20 shadow-sm relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center mb-3">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#15172A] mb-1">
                    1. Organizamos nuestros encuentros
                  </h3>
                  <p className="text-xs text-[#62677F] leading-relaxed">
                    Planifica fechas, lugares, tareas y confirmaciones de asistencia sin que nadie se quede afuera.
                  </p>
                </div>

                {/* Benefit 2 */}
                <div className="p-5 rounded-2xl bg-white border border-[#8B5CFF]/20 shadow-sm relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CFF]/10 text-[#8B5CFF] flex items-center justify-center mb-3">
                    <Vote className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#15172A] mb-1">
                    2. Decidimos juntos
                  </h3>
                  <p className="text-xs text-[#62677F] leading-relaxed">
                    Votaciones simples y transparentes de fechas y lugares para acordar el mejor momento en familia.
                  </p>
                </div>

                {/* Benefit 3 */}
                <div className="p-5 rounded-2xl bg-white border border-[#FF2EB5]/20 shadow-sm relative overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center mb-3">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#15172A] mb-1">
                    3. Conservamos nuestros recuerdos
                  </h3>
                  <p className="text-xs text-[#62677F] leading-relaxed">
                    Galerías compartidas con fotografías y anécdotas para revivir cada momento compartido.
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#62677F] border-t border-gray-100 z-10">
        <p>© SalCie — Un espacio privado para encuentros familiares.</p>
      </footer>
    </div>
  );
};
