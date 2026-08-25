import React from 'react';
import { motion } from 'motion/react';
import { Users, Calendar, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Family, Meeting } from '../types';

interface FamiliesScreenProps {
  families: Family[];
  meetings: Meeting[];
  onSelectFamily: (familyId: string) => void;
  onOpenNewFamilyModal: () => void;
}

export const FamiliesScreen: React.FC<FamiliesScreenProps> = ({
  families,
  meetings,
  onSelectFamily,
  onOpenNewFamilyModal,
}) => {
  return (
    <div id="families-screen" className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">
              Tus Espacios Familiares
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15172A] font-brand">
            Mis familias
          </h1>
          <p className="text-sm text-[#62677F] mt-1">
            Cada familia es un espacio privado e independiente. Selecciona a cuál deseas ingresar.
          </p>
        </div>

        <button
          id="create-family-header-btn"
          onClick={onOpenNewFamilyModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-salcie-btn text-sm font-bold shadow-md shadow-pink-500/20 transition-all hover:scale-102 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Crear nueva familia</span>
        </button>
      </div>

      {/* Families Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {families.map((family, idx) => {
          // Get next upcoming meeting for this specific family
          const familyMeetings = meetings.filter(
            (m) => m.familyId === family.id && m.status !== 'finalizado'
          );
          const nextMeeting = familyMeetings[0];

          return (
            <motion.div
              key={family.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all card-hover-effect flex flex-col justify-between"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-44 sm:h-48 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={family.coverUrl}
                    alt={family.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B1A]/80 via-[#090B1A]/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#15172A] flex items-center gap-1.5 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#287BFF]" />
                    <span>Espacio privado</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-brand drop-shadow-sm">
                      {family.name}
                    </h2>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                  {/* Members count & avatars */}
                  <div className="flex items-center justify-between text-xs text-[#62677F] pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#287BFF]" />
                      <span className="font-semibold text-[#15172A]">
                        {family.members.length} integrantes
                      </span>
                    </div>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {family.members.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white"
                          style={{ backgroundColor: member.avatarColor || '#287BFF' }}
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {family.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-[10px] font-bold text-[#62677F] flex items-center justify-center ring-2 ring-white">
                          +{family.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next meeting info */}
                  <div className="bg-[#F7F8FF] rounded-xl p-3.5 border border-[#287BFF]/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#62677F] mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF2EB5]" /> Próximo encuentro
                    </p>
                    {nextMeeting ? (
                      <div>
                        <p className="text-sm font-bold text-[#15172A] line-clamp-1">
                          {nextMeeting.title}
                        </p>
                        <p className="text-xs text-[#62677F] mt-0.5">
                          {nextMeeting.status === 'votacion'
                            ? 'Votación de fecha y lugar en curso'
                            : nextMeeting.dateTimeConfirmed || 'Fecha a confirmar'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#62677F] italic">
                        No hay encuentros programados por ahora.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  id={`enter-family-${family.id}-btn`}
                  onClick={() => onSelectFamily(family.id)}
                  className="w-full py-3 px-4 rounded-xl bg-[#15172A] hover:bg-[#287BFF] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Entrar al espacio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
