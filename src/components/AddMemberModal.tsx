import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, X, Shield, User } from 'lucide-react';
import { FamilyMember, MemberRole } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Omit<FamilyMember, 'id' | 'inviteStatus'>) => void;
  editingMember?: FamilyMember | null;
  onUpdate?: (member: FamilyMember) => void;
}

const AVATAR_COLORS = [
  '#FF2EB5', '#287BFF', '#8B5CFF', '#00C8FF', '#10B981', '#F59E0B', '#FF5C93', '#6366F1'
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editingMember,
  onUpdate,
}) => {
  const [name, setName] = useState(editingMember?.name || '');
  const [relation, setRelation] = useState(editingMember?.relation || '');
  const [role, setRole] = useState<MemberRole>(editingMember?.role || 'member');
  const [color, setColor] = useState(editingMember?.avatarColor || AVATAR_COLORS[1]);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Update fields when editingMember changes
  React.useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setRelation(editingMember.relation || '');
      setRole(editingMember.role);
      setColor(editingMember.avatarColor || AVATAR_COLORS[1]);
    } else {
      setName('');
      setRelation('');
      setRole('member');
      setColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
    setErrors({});
  }, [editingMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'El nombre es obligatorio.' });
      return;
    }

    if (editingMember && onUpdate) {
      onUpdate({
        ...editingMember,
        name: name.trim(),
        relation: relation.trim() || undefined,
        role,
        avatarColor: color,
      });
    } else {
      onAdd({
        name: name.trim(),
        relation: relation.trim() || undefined,
        role,
        avatarColor: color,
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="add-member-modal-backdrop" 
        className="fixed inset-0 z-50 bg-[#090B1A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="add-member-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-member-modal-title"
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 id="add-member-modal-title" className="text-xl font-bold text-[#15172A]">
                  {editingMember ? 'Editar integrante' : 'Agregar integrante'}
                </h3>
                <p className="text-xs text-[#62677F]">Invita a un familiar a unirse a este espacio</p>
              </div>
            </div>
            <button
              id="close-add-member-modal-btn"
              onClick={onClose}
              className="p-1 text-[#62677F] hover:text-[#15172A] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="member-name-input" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Nombre completo <span className="text-[#FF2EB5]">*</span>
              </label>
              <input
                id="member-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="Ej. Sofía, Tío Jorge..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#287BFF]'
                }`}
                autoFocus
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="member-relation-input" className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Parentesco o relación <span className="text-xs text-[#62677F] font-normal">(Opcional)</span>
              </label>
              <input
                id="member-relation-input"
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Ej. Hermana, Primo, Mamá, Abuelo..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Rol en la familia
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'member'
                      ? 'border-[#287BFF] bg-[#287BFF]/5 ring-1 ring-[#287BFF]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className={`w-4 h-4 mt-0.5 ${role === 'member' ? 'text-[#287BFF]' : 'text-[#62677F]'}`} />
                  <div>
                    <p className="text-xs font-bold text-[#15172A]">Integrante</p>
                    <p className="text-[11px] text-[#62677F] leading-tight mt-0.5">Vota, asiste, asume tareas y recuerdos</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'admin'
                      ? 'border-[#FF2EB5] bg-[#FF2EB5]/5 ring-1 ring-[#FF2EB5]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className={`w-4 h-4 mt-0.5 ${role === 'admin' ? 'text-[#FF2EB5]' : 'text-[#62677F]'}`} />
                  <div>
                    <p className="text-xs font-bold text-[#15172A]">Administrador</p>
                    <p className="text-[11px] text-[#62677F] leading-tight mt-0.5">Organiza, crea y administra el espacio</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#15172A] mb-1.5">
                Color de avatar
              </label>
              <div className="flex items-center gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Seleccionar color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                id="cancel-add-member-btn"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#15172A] hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="submit-add-member-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#287BFF] text-white font-medium text-sm hover:bg-[#1a6beb] transition-colors shadow-sm"
              >
                {editingMember ? 'Guardar cambios' : 'Guardar integrante'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
