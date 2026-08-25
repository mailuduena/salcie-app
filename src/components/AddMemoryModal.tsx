import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Check, Image as ImageIcon } from 'lucide-react';
import { Memory } from '../types';
import { SAMPLE_MEMORY_PHOTOS } from '../data/mockData';

interface AddMemoryModalProps {
  isOpen: boolean;
  meetingId: string;
  meetingTitle: string;
  authorOptions: string[];
  onClose: () => void;
  onAdd: (memory: Omit<Memory, 'id' | 'createdAt'>) => void;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  meetingId,
  meetingTitle,
  authorOptions,
  onClose,
  onAdd,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_MEMORY_PHOTOS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [anecdote, setAnecdote] = useState('');
  const [authorName, setAuthorName] = useState(authorOptions[0] || 'Mai');
  const [errors, setErrors] = useState<{ photo?: string; anecdote?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const photoToUse = customPhotoUrl.trim() || selectedPhoto;

    if (!photoToUse) {
      setErrors({ photo: 'Selecciona una foto de muestra o ingresa una URL.' });
      return;
    }
    if (!anecdote.trim() && !caption.trim()) {
      setErrors({ anecdote: 'Por favor, escribe una breve anécdota o título para este recuerdo.' });
      return;
    }

    onAdd({
      meetingId,
      photoUrl: photoToUse,
      caption: caption.trim() || undefined,
      anecdote: anecdote.trim() || undefined,
      authorName: authorName.trim() || 'Mai',
    });

    setCaption('');
    setAnecdote('');
    setCustomPhotoUrl('');
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="add-memory-modal-backdrop" 
        className="fixed inset-0 z-50 bg-[#090B1A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="add-memory-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-memory-modal-title"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF2EB5]/20 to-[#8B5CFF]/20 text-[#FF2EB5] flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 id="add-memory-modal-title" className="text-xl font-bold text-[#15172A]">
                  Agregar recuerdo
                </h3>
                <p className="text-xs text-[#62677F] line-clamp-1">{meetingTitle}</p>
              </div>
            </div>
            <button
              id="close-add-memory-modal-btn"
              onClick={onClose}
              className="p-1 text-[#62677F] hover:text-[#15172A] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#15172A] mb-2">
                Selecciona una foto de muestra <span className="text-[#FF2EB5]">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {SAMPLE_MEMORY_PHOTOS.slice(0, 4).map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setCustomPhotoUrl('');
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      selectedPhoto === photo && !customPhotoUrl
                        ? 'border-[#FF2EB5] ring-2 ring-[#FF2EB5]/30 scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt={`Muestra ${idx + 1}`} className="w-full h-full object-cover" />
                    {selectedPhoto === photo && !customPhotoUrl && (
                      <div className="absolute inset-0 bg-[#FF2EB5]/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <ImageIcon className="w-4 h-4 text-[#62677F]" />
                <input
                  type="text"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  placeholder="O ingresa URL de imagen personalizada..."
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="memory-caption-input" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Título o momento <span className="text-xs text-[#62677F] font-normal">(Opcional)</span>
              </label>
              <input
                id="memory-caption-input"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ej. Momento del brindis, Risas en el patio..."
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="memory-anecdote-input" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Anécdota o mensaje <span className="text-[#FF2EB5]">*</span>
              </label>
              <textarea
                id="memory-anecdote-input"
                rows={3}
                value={anecdote}
                onChange={(e) => {
                  setAnecdote(e.target.value);
                  if (errors.anecdote) setErrors({});
                }}
                placeholder="Cuenta qué pasó en ese momento, qué dijeron o qué anécdota inolvidable quedó grabada..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none transition-colors resize-none ${
                  errors.anecdote ? 'border-red-500' : 'border-gray-200 focus:border-[#287BFF]'
                }`}
              />
              {errors.anecdote && <p className="text-xs text-red-500 mt-1">{errors.anecdote}</p>}
            </div>

            <div>
              <label htmlFor="memory-author-select" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                ¿Quién agrega este recuerdo?
              </label>
              <select
                id="memory-author-select"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
              >
                {authorOptions.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                id="cancel-add-memory-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#15172A] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-add-memory-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2EB5] to-[#8B5CFF] text-white font-medium text-sm hover:opacity-95 shadow-md shadow-pink-500/20 transition-opacity"
              >
                Guardar recuerdo
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
