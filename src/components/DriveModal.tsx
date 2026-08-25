import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HardDrive, X, Sparkles } from 'lucide-react';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveModal: React.FC<DriveModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="drive-modal-backdrop" 
        className="fixed inset-0 z-50 bg-[#090B1A]/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          id="drive-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-modal-title"
        >
          {/* Subtle accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#287BFF] via-[#8B5CFF] to-[#FF2EB5]" />

          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center">
              <HardDrive className="w-6 h-6" />
            </div>
            <button
              id="close-drive-modal-btn"
              onClick={onClose}
              className="p-1 text-[#62677F] hover:text-[#15172A] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 id="drive-modal-title" className="text-xl font-bold text-[#15172A] mb-2">
            Álbum en Google Drive
          </h3>

          <div className="bg-[#F7F8FF] border border-[#287BFF]/20 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-[#287BFF] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Demostración de producto
            </p>
            <p className="text-sm text-[#15172A] leading-relaxed">
              La integración con Google Drive estará disponible en la versión conectada.
            </p>
          </div>

          <p className="text-sm text-[#62677F] leading-relaxed mb-6">
            En la versión completa de SalCie, cada encuentro sincroniza automáticamente una carpeta compartida privada en Google Drive con fotos en alta resolución para que ningún recuerdo familiar se pierda.
          </p>

          <div className="flex justify-end">
            <button
              id="confirm-drive-modal-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#15172A] text-white font-medium text-sm hover:bg-[#232742] transition-colors"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
