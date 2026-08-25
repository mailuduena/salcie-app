import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Check, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_FAMILY_COVERS } from '../data/mockData';

interface NewFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, coverUrl: string, creatorName: string) => void;
}

export const NewFamilyModal: React.FC<NewFamilyModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [creatorName, setCreatorName] = useState('Mai');
  const [selectedCover, setSelectedCover] = useState(SAMPLE_FAMILY_COVERS[0]);
  const [customCover, setCustomCover] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Por favor, ingresa el nombre de la familia o espacio.' });
      return;
    }

    const finalCover = customCover.trim() || selectedCover;
    onCreate(name.trim(), finalCover, creatorName.trim() || 'Mai');
    setName('');
    setCustomCover('');
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="new-family-modal-backdrop" 
        className="fixed inset-0 z-50 bg-[#090B1A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="new-family-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-family-modal-title"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 id="new-family-modal-title" className="text-xl font-bold text-[#15172A]">
                  Crear nueva familia
                </h3>
                <p className="text-xs text-[#62677F]">Crea un espacio privado exclusivo para tu grupo</p>
              </div>
            </div>
            <button
              id="close-new-family-modal-btn"
              onClick={onClose}
              className="p-1 text-[#62677F] hover:text-[#15172A] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="family-name-input" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Nombre del espacio familiar <span className="text-[#FF2EB5]">*</span>
              </label>
              <input
                id="family-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="Ej. Familia Gómez, Primos del Sur..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#287BFF]'
                }`}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="family-creator-input" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Creado por
              </label>
              <input
                id="family-creator-input"
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Tu nombre (ej. Mai)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#15172A] mb-2 flex items-center justify-between">
                <span>Foto de portada</span>
                <span className="text-xs text-[#62677F] font-normal">Opcional</span>
              </label>
              
              <div className="grid grid-cols-4 gap-2 mb-2">
                {SAMPLE_FAMILY_COVERS.map((cover, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCover(cover);
                      setCustomCover('');
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                      selectedCover === cover && !customCover ? 'border-[#FF2EB5] ring-2 ring-[#FF2EB5]/30' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={cover} alt={`Muestra ${idx + 1}`} className="w-full h-full object-cover" />
                    {selectedCover === cover && !customCover && (
                      <div className="absolute inset-0 bg-[#FF2EB5]/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <ImageIcon className="w-4 h-4 text-[#62677F]" />
                <input
                  type="text"
                  value={customCover}
                  onChange={(e) => setCustomCover(e.target.value)}
                  placeholder="O pega el enlace de una imagen..."
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                id="cancel-create-family-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#15172A] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-create-family-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2EB5] via-[#8B5CFF] to-[#287BFF] text-white font-medium text-sm hover:opacity-95 shadow-md shadow-pink-500/20 transition-opacity"
              >
                Crear familia
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
