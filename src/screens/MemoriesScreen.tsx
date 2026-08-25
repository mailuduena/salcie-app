import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Plus, HardDrive, Filter, Sparkles, MessageSquare } from 'lucide-react';
import { Family, Meeting, Memory } from '../types';
import { useToast } from '../components/ToastContext';
import { DriveModal } from '../components/DriveModal';
import { AddMemoryModal } from '../components/AddMemoryModal';

interface MemoriesScreenProps {
  activeFamily: Family;
  meetings: Meeting[];
  onUpdateMeeting: (meeting: Meeting) => void;
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({
  activeFamily,
  meetings,
  onUpdateMeeting,
}) => {
  const { showToast } = useToast();
  const [selectedMeetingFilter, setSelectedMeetingFilter] = useState<string>('all');
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);

  // Filter meetings by active family
  const familyMeetings = meetings.filter((m) => m.familyId === activeFamily.id);

  // All memories in this family, tagged with their meeting info
  const allMemoriesWithMeeting = familyMeetings.flatMap((m) =>
    (m.memories || []).map((mem) => ({
      ...mem,
      meetingTitle: m.title,
      meetingType: m.type,
      meetingId: m.id,
    }))
  );

  const filteredMemories = allMemoriesWithMeeting.filter((mem) => {
    if (selectedMeetingFilter !== 'all' && mem.meetingId !== selectedMeetingFilter) {
      return false;
    }
    return true;
  });

  const handleAddMemory = (newMem: Omit<Memory, 'id' | 'createdAt'>) => {
    const targetMeeting = familyMeetings.find((m) => m.id === newMem.meetingId) || familyMeetings[0];
    if (!targetMeeting) return;

    const fullMemory: Memory = {
      ...newMem,
      id: `mem-global-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateMeeting({
      ...targetMeeting,
      memories: [fullMemory, ...(targetMeeting.memories || [])],
    });

    showToast('¡Recuerdo agregado al álbum familiar!');
  };

  const defaultMeetingForAdd = familyMeetings.find((m) => m.status === 'finalizado') || familyMeetings[0];

  return (
    <div id="memories-screen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">
              Álbum Privado de {activeFamily.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15172A] font-brand">
            Recuerdos familiares
          </h1>
          <p className="text-xs sm:text-sm text-[#62677F] mt-0.5">
            “Guardamos lo vivido para siempre”. Fotografías y anécdotas compartidas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {defaultMeetingForAdd && (
            <button
              id="memories-add-btn"
              onClick={() => setShowAddMemoryModal(true)}
              className="px-5 py-2.5 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-500/20 flex items-center gap-2 hover:scale-102 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar recuerdo</span>
            </button>
          )}

          <button
            id="memories-drive-btn"
            onClick={() => setShowDriveModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#287BFF]/30 text-[#287BFF] hover:bg-[#F7F8FF] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <HardDrive className="w-4 h-4" />
            <span>Álbum en Drive</span>
          </button>
        </div>
      </div>

      {/* Filter by Meeting Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#15172A]">
          <Filter className="w-4 h-4 text-[#287BFF]" />
          <span>Filtrar por encuentro:</span>
        </div>

        <select
          id="memories-meeting-filter"
          value={selectedMeetingFilter}
          onChange={(e) => setSelectedMeetingFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#15172A] bg-[#F7F8FF] focus:outline-none focus:border-[#287BFF] max-w-xs truncate"
        >
          <option value="all">Todos los encuentros ({allMemoriesWithMeeting.length} recuerdos)</option>
          {familyMeetings.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.memories?.length || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Memories Masonry / Grid */}
      {filteredMemories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((mem, idx) => (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all card-hover-effect flex flex-col justify-between"
            >
              <div>
                {/* Photo */}
                <div className="h-52 sm:h-56 bg-gray-100 overflow-hidden relative">
                  <img
                    src={mem.photoUrl}
                    alt={mem.caption || 'Recuerdo familiar'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B1A]/70 via-transparent to-transparent" />
                  
                  {/* Meeting Tag Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#15172A] uppercase tracking-wider shadow-xs">
                      {mem.meetingTitle}
                    </span>
                  </div>

                  {mem.caption && (
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-sm font-bold font-brand drop-shadow-sm line-clamp-1">
                        {mem.caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Anecdote story */}
                {mem.anecdote && (
                  <div className="p-5">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#FF2EB5] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#15172A] italic leading-relaxed">
                        “{mem.anecdote}”
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Author & Date Footer */}
              <div className="px-5 py-3.5 bg-[#F7F8FF] border-t border-gray-100 flex items-center justify-between text-xs text-[#62677F]">
                <span>Guardado por <strong className="text-[#15172A]">{mem.authorName}</strong></span>
                <span>{mem.createdAt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF2EB5]/10 to-[#287BFF]/10 text-[#FF2EB5] flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#15172A] font-brand">No hay recuerdos en este filtro</h3>
          <p className="text-xs text-[#62677F] leading-relaxed">
            Finaliza encuentros o agrega fotos familiares para conservar las anécdotas de cada reunión.
          </p>
          {defaultMeetingForAdd && (
            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="px-5 py-2.5 rounded-xl gradient-salcie-btn text-xs font-bold text-white shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar recuerdo ahora</span>
            </button>
          )}
        </div>
      )}

      {/* Drive Modal */}
      <DriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />

      {/* Add Memory Modal */}
      {defaultMeetingForAdd && (
        <AddMemoryModal
          isOpen={showAddMemoryModal}
          meetingId={defaultMeetingForAdd.id}
          meetingTitle={defaultMeetingForAdd.title}
          authorOptions={activeFamily.members.map((m) => m.name)}
          onClose={() => setShowAddMemoryModal(false)}
          onAdd={handleAddMemory}
        />
      )}

    </div>
  );
};
