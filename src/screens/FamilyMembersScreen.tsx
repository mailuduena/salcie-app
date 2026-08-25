import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Share2, 
  ShieldCheck, 
  User, 
  Edit3, 
  Trash2, 
  Check, 
  Copy,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Family, FamilyMember } from '../types';
import { useToast } from '../components/ToastContext';
import { AddMemberModal } from '../components/AddMemberModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface FamilyMembersScreenProps {
  activeFamily: Family;
  onUpdateFamily: (family: Family) => void;
  onSwitchMember?: (memberId: string) => void;
}

export const FamilyMembersScreen: React.FC<FamilyMembersScreenProps> = ({
  activeFamily,
  onUpdateFamily,
  onSwitchMember,
}) => {
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  // Copy simulated invitation link
  const handleCopyInviteLink = () => {
    const inviteLink = `https://salcie.app/invitacion/${activeFamily.id}?codigo=FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
    }
    showToast('¡Enlace de invitación simulado copiado al portapapeles!');
  };

  // Add Member
  const handleAddMember = (newMemberData: Omit<FamilyMember, 'id' | 'inviteStatus'>) => {
    const newMember: FamilyMember = {
      ...newMemberData,
      id: `m-${Date.now()}`,
      inviteStatus: 'accepted',
    };

    const updatedFamily: Family = {
      ...activeFamily,
      members: [...activeFamily.members, newMember],
    };

    onUpdateFamily(updatedFamily);
    showToast(`${newMember.name} ha sido agregado a la familia.`);
  };

  // Update Member
  const handleUpdateMember = (updatedMember: FamilyMember) => {
    const updatedMembers = activeFamily.members.map((m) =>
      m.id === updatedMember.id ? updatedMember : m
    );

    onUpdateFamily({
      ...activeFamily,
      members: updatedMembers,
    });
    showToast('Datos del integrante actualizados.');
  };

  // Delete Member
  const handleDeleteMember = () => {
    if (!deletingMember) return;
    const updatedMembers = activeFamily.members.filter((m) => m.id !== deletingMember.id);
    onUpdateFamily({
      ...activeFamily,
      members: updatedMembers,
    });
    showToast(`${deletingMember.name} fue eliminado del espacio familiar.`);
    setDeletingMember(null);
  };

  return (
    <div id="family-members-screen" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#287BFF] uppercase tracking-wider">
              {activeFamily.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15172A] font-brand">
            Integrantes de la familia
          </h1>
          <p className="text-xs sm:text-sm text-[#62677F] mt-0.5">
            Administra los miembros del espacio y comparte invitaciones privadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="copy-invite-link-btn"
            onClick={handleCopyInviteLink}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#287BFF]/30 text-[#287BFF] hover:bg-[#F7F8FF] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copiar invitación</span>
          </button>

          <button
            id="add-member-top-btn"
            onClick={() => {
              setEditingMember(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-500/20 flex items-center gap-2 hover:scale-102 transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar integrante</span>
          </button>
        </div>
      </div>

      {/* Role Explanation Card & Demo Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#15172A]">Administradores</h3>
            <p className="text-[11px] text-[#62677F] leading-relaxed mt-0.5">
              Pueden crear, editar y eliminar encuentros, configurar opciones y administrar integrantes.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#15172A]">Integrantes</h3>
            <p className="text-[11px] text-[#62677F] leading-relaxed mt-0.5">
              Pueden votar fechas y lugares, confirmar su asistencia, asumir tareas y guardar recuerdos.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Switcher Quick Guide Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF2EB5]/10 via-[#8B5CFF]/10 to-[#287BFF]/10 border border-[#FF2EB5]/20 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-[#FF2EB5] flex items-center justify-center shrink-0 shadow-xs">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[#15172A]">
            Prueba interactiva multi-usuario
          </h3>
          <p className="text-[11px] text-[#62677F] leading-relaxed mt-0.5">
            SalCie está pensada para usarse en familia. Hacé clic en <strong>“Probar como [Nombre]”</strong> en cualquier integrante para navegar la aplicación como esa persona y probar cómo vota fechas, propone lugares o confirma asistencia.
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-xs font-bold text-[#15172A]">
            Total de integrantes ({activeFamily.members.length})
          </span>
          <span className="text-[11px] text-[#62677F]">
            Creado por <strong>{activeFamily.creatorName}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {activeFamily.members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                member.isCurrentUser
                  ? 'border-[#FF2EB5]/40 bg-[#FF2EB5]/5 ring-1 ring-[#FF2EB5]/20'
                  : 'border-gray-100 hover:border-[#287BFF]/30 bg-[#F7F8FF]/50 hover:bg-[#F7F8FF]'
              }`}
            >
              {/* Member Avatar & Details */}
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-full text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: member.avatarColor || '#287BFF' }}
                >
                  {member.name.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-[#15172A]">{member.name}</h3>
                    {member.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF2EB5] text-white text-[10px] font-bold shadow-xs">
                        Activo en demo (Tú)
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      member.role === 'admin'
                        ? 'bg-[#FF2EB5]/10 text-[#FF2EB5] border border-[#FF2EB5]/20'
                        : 'bg-white text-[#287BFF] border border-[#287BFF]/20'
                    }`}>
                      {member.role === 'admin' ? 'Administrador' : 'Integrante'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#62677F] mt-0.5">
                    {member.relation && (
                      <span>{member.relation} &bull;</span>
                    )}
                    <span className="capitalize">{member.inviteStatus === 'accepted' ? 'Invitación aceptada' : 'Invitación pendiente'}</span>
                  </div>
                </div>
              </div>

              {/* Demo switch button & Actions */}
              <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                {onSwitchMember && (
                  member.isCurrentUser ? (
                    <span className="px-3 py-1.5 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] text-xs font-bold flex items-center gap-1 border border-[#FF2EB5]/20">
                      <Check className="w-3.5 h-3.5" />
                      <span>Navegando como {member.name}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onSwitchMember(member.id)}
                      className="px-3 py-1.5 rounded-xl border border-[#FF2EB5]/40 bg-white hover:bg-[#FF2EB5]/10 text-[#FF2EB5] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:scale-102 active:scale-98 cursor-pointer"
                      title={`Probar la demo como ${member.name}`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Probar como {member.name}</span>
                    </button>
                  )
                )}

                <div className="flex items-center gap-1 pl-1 border-l border-gray-200">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 text-[#62677F] hover:text-[#15172A] hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Editar integrante"
                    aria-label={`Editar ${member.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {!member.isCurrentUser && (
                    <button
                      onClick={() => setDeletingMember(member)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar de la familia"
                      aria-label={`Eliminar a ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMember(null);
        }}
        onAdd={handleAddMember}
        editingMember={editingMember}
        onUpdate={handleUpdateMember}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={!!deletingMember}
        title="¿Eliminar integrante?"
        message={`¿Estás seguro de que deseas eliminar a ${deletingMember?.name} de este espacio familiar?`}
        confirmLabel="Eliminar integrante"
        isDestructive={true}
        onConfirm={handleDeleteMember}
        onClose={() => setDeletingMember(null)}
      />

    </div>
  );
};
