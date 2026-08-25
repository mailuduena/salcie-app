import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Vote, 
  CheckSquare, 
  Share2, 
  Camera, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Sparkles, 
  HardDrive,
  Award,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Family, Meeting, MeetingStatus, RSVPStatus, Memory, MeetingTask, PollOption } from '../types';
import { useToast } from '../components/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { DriveModal } from '../components/DriveModal';
import { AddMemoryModal } from '../components/AddMemoryModal';

// Spanish months for selectors
const MONTHS_SPANISH = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

function formatSpanishDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const dateObj = new Date(year, month - 1, day);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const weekday = days[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];
  const formattedTime = timeStr && timeStr.trim() ? timeStr.trim() : '00:00';

  return `${weekday} ${day} de ${monthName} · ${formattedTime}`;
}

interface MeetingDetailScreenProps {
  meeting: Meeting;
  activeFamily: Family;
  onBack: () => void;
  onUpdateMeeting: (updated: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onSwitchMember?: (memberId: string) => void;
}

export const MeetingDetailScreen: React.FC<MeetingDetailScreenProps> = ({
  meeting,
  activeFamily,
  onBack,
  onUpdateMeeting,
  onDeleteMeeting,
  onSwitchMember,
}) => {
  const { showToast } = useToast();

  // Modals state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);

  // New task inline state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Editing task inline state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskAssignee, setEditingTaskAssignee] = useState('');

  // Current user's RSVP status
  const currentMember = activeFamily.members.find((m) => m.isCurrentUser) || activeFamily.members[0];
  const currentUserRsvp = meeting.rsvps.find((r) => r.memberId === currentMember.id)?.status;

  // Location voting calculations
  const totalLocationVotes = meeting.locationOptions.reduce((acc, o) => acc + o.voterIds.length, 0);
  const maxLocationVotes = meeting.locationOptions.length > 0
    ? Math.max(...meeting.locationOptions.map((o) => o.voterIds.length))
    : 0;
  const winningLocationOptions = maxLocationVotes > 0
    ? meeting.locationOptions.filter((o) => o.voterIds.length === maxLocationVotes)
    : [];
  const isLocationTie = winningLocationOptions.length > 1;
  const singleWinningLocation = winningLocationOptions.length === 1 ? winningLocationOptions[0] : null;

  // --- Voting Handler ---
  const handleVote = (pollType: 'datetime' | 'location', optionId: string) => {
    const isDateTime = pollType === 'datetime';
    const targetOptions = isDateTime ? meeting.dateTimeOptions : meeting.locationOptions;

    const updatedOptions = targetOptions.map((opt) => {
      const alreadyVoted = opt.voterIds.includes(currentMember.id);
      if (opt.id === optionId) {
        // Toggle vote on this option
        return {
          ...opt,
          voterIds: alreadyVoted
            ? opt.voterIds.filter((id) => id !== currentMember.id)
            : [...opt.voterIds, currentMember.id],
        };
      } else {
        // Remove vote from other options in single-choice mode
        return {
          ...opt,
          voterIds: opt.voterIds.filter((id) => id !== currentMember.id),
        };
      }
    });

    onUpdateMeeting({
      ...meeting,
      dateTimeOptions: isDateTime ? updatedOptions : meeting.dateTimeOptions,
      locationOptions: !isDateTime ? updatedOptions : meeting.locationOptions,
    });

    showToast('Tu voto ha sido registrado.');
  };

  // --- Confirm Winning Options ---
  const handleConfirmOption = (pollType: 'datetime' | 'location', winningText: string) => {
    if (pollType === 'datetime') {
      const updated = {
        ...meeting,
        dateTimeConfirmed: winningText,
        // If location is also confirmed or none, we can set status to 'confirmado'
        status: (meeting.locationConfirmed || meeting.locationOptions.length === 0) ? 'confirmado' as MeetingStatus : meeting.status
      };
      onUpdateMeeting(updated);
      showToast(`Fecha confirmada: ${winningText}`);
    } else {
      const updated = {
        ...meeting,
        locationConfirmed: winningText,
        status: (meeting.dateTimeConfirmed || meeting.dateTimeOptions.length === 0) ? 'confirmado' as MeetingStatus : meeting.status
      };
      onUpdateMeeting(updated);
      showToast(`Lugar confirmado: ${winningText}`);
    }
  };

  // --- RSVP Handler ---
  const handleRSVP = (status: RSVPStatus) => {
    const otherRsvps = meeting.rsvps.filter((r) => r.memberId !== currentMember.id);
    const updatedRsvps = [...otherRsvps, { memberId: currentMember.id, status, updatedAt: new Date().toISOString() }];

    onUpdateMeeting({
      ...meeting,
      rsvps: updatedRsvps,
    });

    const statusLabels = { voy: '¡Confirmaste tu asistencia!', quizas: 'Respuesta guardada como quizás', no_voy: 'Has indicado que no podrás asistir' };
    showToast(statusLabels[status]);
  };

  // --- Task Handlers ---
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = meeting.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateMeeting({ ...meeting, tasks: updatedTasks });
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: MeetingTask = {
      id: `t-custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      assignedMemberId: newTaskAssignee || undefined,
      completed: false,
    };
    onUpdateMeeting({ ...meeting, tasks: [...meeting.tasks, newTask] });
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setIsAddingTask(false);
    showToast('Tarea agregada con éxito.');
  };

  const handleSaveEditTask = (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    const updatedTasks = meeting.tasks.map((t) =>
      t.id === taskId
        ? { ...t, title: editingTaskTitle.trim(), assignedMemberId: editingTaskAssignee || undefined }
        : t
    );
    onUpdateMeeting({ ...meeting, tasks: updatedTasks });
    setEditingTaskId(null);
    showToast('Tarea actualizada.');
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = meeting.tasks.filter((t) => t.id !== taskId);
    onUpdateMeeting({ ...meeting, tasks: updatedTasks });
    showToast('Tarea eliminada.');
  };

  // --- Status Transitions ---
  const handleChangeStatus = (newStatus: MeetingStatus) => {
    onUpdateMeeting({ ...meeting, status: newStatus });
    const msgs: Record<MeetingStatus, string> = {
      propuesta: 'Encuentro marcado como propuesta',
      votacion: 'Votación reabierta',
      esperando_sugerencias: 'Encuentro en espera de sugerencias de fechas',
      confirmado: '¡Encuentro confirmado con éxito!',
      finalizado: 'Encuentro finalizado. ¡Ya puedes guardar los recuerdos!',
    };
    showToast(msgs[newStatus]);
  };

  // --- Share / Copy WhatsApp summary ---
  const handleCopySummary = () => {
    const confirmedCount = meeting.rsvps.filter((r) => r.status === 'voy').length;
    const dateText = meeting.dateTimeConfirmed || (meeting.dateTimeOptions[0]?.text || 'Fecha a definir');
    const placeText = meeting.locationConfirmed || (meeting.locationOptions[0]?.text || 'Lugar a definir');
    
    const assignedTasksText = meeting.tasks
      .map((t) => {
        const member = activeFamily.members.find((m) => m.id === t.assignedMemberId);
        return member ? `${member.name} lleva/hace ${t.title}` : `${t.title} (sin asignar)`;
      })
      .slice(0, 3)
      .join(', ');

    const whatsappMessage = `${meeting.title}.\n📅 ${dateText} en ${placeText}.\n👥 Hay ${confirmedCount} personas confirmadas.\n📋 Tareas: ${assignedTasksText || 'A coordinar'}.\n\nOrganizado con SalCie.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(whatsappMessage);
    }
    showToast('¡Resumen copiado para enviar por WhatsApp!');
  };

  // Memory Addition
  const handleAddMemory = (newMem: Omit<Memory, 'id' | 'createdAt'>) => {
    const fullMemory: Memory = {
      ...newMem,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onUpdateMeeting({
      ...meeting,
      memories: [fullMemory, ...meeting.memories],
    });
    showToast('¡Recuerdo agregado al álbum!');
  };

  // Filtered RSVPs
  const confirmedRSVPs = meeting.rsvps.filter((r) => r.status === 'voy');
  const maybeRSVPs = meeting.rsvps.filter((r) => r.status === 'quizas');
  const declinedRSVPs = meeting.rsvps.filter((r) => r.status === 'no_voy');

  return (
    <div id="meeting-detail-screen" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Top Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="back-from-detail-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#62677F] hover:text-[#15172A] p-2 rounded-xl hover:bg-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a encuentros</span>
        </button>

        {/* Status Control Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {meeting.status !== 'confirmado' && meeting.status !== 'finalizado' && (
            <button
              id="confirm-meeting-status-btn"
              onClick={() => handleChangeStatus('confirmado')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar encuentro</span>
            </button>
          )}

          {meeting.status === 'confirmado' && (
            <button
              id="finish-meeting-status-btn"
              onClick={() => handleChangeStatus('finalizado')}
              className="px-3.5 py-1.5 rounded-xl bg-[#8B5CFF] hover:bg-[#7846fa] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Finalizar y guardar recuerdos</span>
            </button>
          )}

          <button
            id="delete-meeting-btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Eliminar encuentro"
            aria-label="Eliminar encuentro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Persona Switcher Banner in Meeting Detail */}
      {onSwitchMember && activeFamily.members.length > 1 && (
        <div className="bg-gradient-to-r from-[#FF2EB5]/10 via-[#8B5CFF]/10 to-[#287BFF]/10 p-3.5 sm:p-4 rounded-2xl border border-[#FF2EB5]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
              style={{ backgroundColor: currentMember.avatarColor || '#FF2EB5' }}
            >
              {currentMember.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#15172A]">
                  Interactuando como: <strong className="text-[#FF2EB5]">{currentMember.name}</strong>
                </span>
                <span className="text-[10px] font-semibold bg-white/80 border border-gray-200 px-1.5 py-0.2 rounded-md text-[#62677F]">
                  {currentMember.relation || (currentMember.role === 'admin' ? 'Admin' : 'Integrante')}
                </span>
              </div>
              <p className="text-[11px] text-[#62677F]">
                Cambiá de integrante con un clic para votar o proponer desde su cuenta:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {activeFamily.members.map((member) => {
              const isSelected = member.id === currentMember.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSwitchMember(member.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF2EB5] text-white shadow-xs'
                      : 'bg-white text-[#15172A] border border-gray-200 hover:border-[#FF2EB5]/50 hover:bg-[#FF2EB5]/5'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                    style={{ backgroundColor: member.avatarColor || '#287BFF' }}
                  >
                    {member.name.charAt(0)}
                  </span>
                  <span>{member.name}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Hero Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#287BFF]/15 shadow-md relative">
        {/* Cover image banner */}
        <div className="relative h-56 sm:h-72 w-full bg-gray-100">
          <img
            src={meeting.coverUrl || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80'}
            alt={meeting.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090B1A]/85 via-[#090B1A]/40 to-transparent" />

          {/* Badges on Banner */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#15172A] uppercase tracking-wider shadow-sm">
              {meeting.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#090B1A]/70 backdrop-blur-md text-xs font-semibold text-white">
              {activeFamily.name}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm ${
              meeting.status === 'esperando_sugerencias'
                ? 'bg-[#8B5CFF] text-white'
                : meeting.status === 'votacion'
                ? 'bg-[#8B5CFF] text-white'
                : meeting.status === 'confirmado'
                ? 'bg-emerald-500 text-white'
                : meeting.status === 'finalizado'
                ? 'bg-[#287BFF] text-white'
                : 'bg-amber-500 text-white'
            }`}>
              {meeting.status === 'esperando_sugerencias' 
                ? '🕒 Esperando sugerencias' 
                : meeting.status === 'votacion' 
                ? '🗳️ En votación' 
                : meeting.status === 'confirmado' 
                ? '✅ Confirmado' 
                : meeting.status === 'finalizado' 
                ? '📸 Finalizado' 
                : '💡 Propuesta'}
            </span>
          </div>

          {/* Bottom Title & Description in Banner */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-brand tracking-tight drop-shadow-md">
              {meeting.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1.5 max-w-2xl drop-shadow-sm leading-relaxed">
              {meeting.description}
            </p>
          </div>
        </div>

        {/* Quick Meta Strip */}
        <div className="p-4 sm:p-6 bg-[#F7F8FF] border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#62677F] uppercase tracking-wider">Fecha y hora</p>
              <p className="text-xs sm:text-sm font-bold text-[#15172A]">
                {meeting.dateTimeConfirmed || (
                  meeting.dateTimeOptions.length > 0
                    ? `${meeting.dateTimeOptions.length} ${meeting.dateTimeOptions.length === 1 ? 'opción en votación' : 'opciones en votación'}`
                    : 'A coordinar'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#62677F] uppercase tracking-wider">Lugar</p>
              <p className="text-xs sm:text-sm font-bold text-[#15172A]">
                {meeting.locationConfirmed || (
                  singleWinningLocation
                    ? `${singleWinningLocation.text} (va ganando)`
                    : isLocationTie
                    ? `Empate (${winningLocationOptions.length} lugares)`
                    : meeting.locationOptions.length > 0
                    ? `${meeting.locationOptions.length} opciones en votación`
                    : 'A coordinar'
                )}
              </p>
              {meeting.locationAddress && (
                <p className="text-[11px] text-[#62677F]">{meeting.locationAddress}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CFF]/10 text-[#8B5CFF] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#62677F] uppercase tracking-wider">Asistencia</p>
              <p className="text-xs sm:text-sm font-bold text-[#15172A]">
                {confirmedRSVPs.length} confirmados de {meeting.invitedMemberIds.length}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmed Meeting Summary Card (Special Highlight Card) */}
      {(meeting.status === 'confirmado' || meeting.dateTimeConfirmed) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#287BFF]/10 via-[#8B5CFF]/10 to-[#FF2EB5]/10 rounded-3xl p-6 sm:p-7 border border-[#287BFF]/30 shadow-md relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>¡Encuentro confirmado!</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#15172A] font-brand">
                {meeting.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#15172A] font-medium mt-1">
                📍 {meeting.locationConfirmed || 'Lugar confirmado'} &bull; 📅 {meeting.dateTimeConfirmed || 'Fecha acordada'}
              </p>
              <p className="text-xs text-[#62677F] mt-1">
                Hay {confirmedRSVPs.length} personas confirmadas. Tareas asignadas: {meeting.tasks.filter(t => t.assignedMemberId).length} de {meeting.tasks.length}.
              </p>
            </div>

            <button
              id="share-whatsapp-summary-btn"
              onClick={handleCopySummary}
              className="px-5 py-3 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 hover:scale-102 transition-transform shrink-0"
            >
              <Share2 className="w-4 h-4" />
              <span>Compartir resumen</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid: Fechas sugeridas por la familia & Asistencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Votación de fecha Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#15172A] font-brand">
                  Votación de fecha
                </h2>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                meeting.dateTimeConfirmed 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-[#287BFF]/10 text-[#287BFF] border border-[#287BFF]/20'
              }`}>
                {meeting.dateTimeConfirmed 
                  ? '✅ Fecha confirmada' 
                  : '🗳️ Votación de fecha abierta'}
              </span>
            </div>
            <p className="text-xs text-[#62677F] mt-1.5 leading-relaxed">
              Elegí la opción que prefieras. La fecha con más votos será la seleccionada.
            </p>
          </div>

          {/* List of Date Options for voting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#15172A] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#287BFF]" />
                Opciones para votar ({meeting.dateTimeOptions.length}):
              </span>
              <span className="text-[#62677F] text-[11px]">Toca para votar</span>
            </div>

            {meeting.dateTimeOptions.length === 0 ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2 bg-[#F7F8FF]/50">
                <Calendar className="w-8 h-8 text-[#287BFF]/50 mx-auto" />
                <p className="text-xs font-bold text-[#15172A]">
                  No se definieron opciones de fecha para este encuentro
                </p>
                <p className="text-[11px] text-[#62677F] max-w-xs mx-auto">
                  Las opciones de fecha se configuran durante la creación del encuentro.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {meeting.dateTimeOptions.map((opt) => {
                  const hasVoted = opt.voterIds.includes(currentMember.id);
                  const isWinning = opt.voterIds.length > 0 && Math.max(...meeting.dateTimeOptions.map(o => o.voterIds.length)) === opt.voterIds.length;

                  return (
                    <div
                      key={opt.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        hasVoted
                          ? 'border-[#287BFF] bg-[#287BFF]/5 ring-1 ring-[#287BFF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleVote('datetime', opt.id)}
                          className="flex-1 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#15172A] capitalize">{opt.text}</span>
                            {isWinning && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Award className="w-3 h-3" /> Opción más elegida
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#62677F]">
                            {opt.suggestedByName && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium">
                                Propuesta por: <strong>{opt.suggestedByName}</strong>
                              </span>
                            )}
                            {opt.note && <span>• {opt.note}</span>}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVote('datetime', opt.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                            hasVoted
                              ? 'bg-[#287BFF] text-white shadow-xs'
                              : 'bg-white text-[#287BFF] border border-[#287BFF]/40 hover:bg-[#287BFF]/10'
                          }`}
                        >
                          {hasVoted ? '✓ Mi voto' : 'Votar'}
                        </button>
                      </div>

                      {/* Voters avatars & count */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {opt.voterIds.map((vId) => {
                              const vMember = activeFamily.members.find((m) => m.id === vId);
                              return (
                                <div
                                  key={vId}
                                  className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-1 ring-white"
                                  style={{ backgroundColor: vMember?.avatarColor || '#8B5CFF' }}
                                  title={vMember?.name}
                                >
                                  {vMember?.name.charAt(0)}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-[11px] text-[#62677F] font-semibold">
                            {opt.voterIds.length} {opt.voterIds.length === 1 ? 'voto' : 'votos'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Votación de lugar */}
          <div className="space-y-4 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#15172A] font-brand">
                  Votación de lugar
                </h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  meeting.locationConfirmed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#FF2EB5]/10 text-[#FF2EB5] border border-[#FF2EB5]/20'
                }`}
              >
                {meeting.locationConfirmed
                  ? '✅ Lugar confirmado'
                  : '🗳️ Votación de lugar abierta'}
              </span>
            </div>

            <p className="text-xs text-[#62677F] leading-relaxed">
              {meeting.locationConfirmed
                ? 'El lugar del encuentro ya fue acordado por la familia.'
                : 'Elegí la opción que prefieras. El lugar con más votos será el seleccionado.'}
            </p>

            {/* Tarjeta de estado: Lugar que va ganando / Empate / Votación pendiente */}
            {!meeting.locationConfirmed && meeting.locationOptions.length > 0 && (
              <>
                {totalLocationVotes === 0 ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F8FF] border border-dashed border-[#FF2EB5]/30 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0 mt-0.5">
                      <Vote className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#15172A]">
                        La votación todavía no comenzó
                      </h4>
                      <p className="text-xs text-[#62677F] leading-relaxed">
                        Sé el primero en votar para definir qué lugar va ganando en la familia.
                      </p>
                    </div>
                  </div>
                ) : isLocationTie ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-pink-50/50 to-indigo-50/50 border border-amber-300/70 shadow-xs space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Vote className="w-3.5 h-3.5 text-amber-600" /> Empate en la votación
                      </span>
                      <span className="text-[11px] font-bold text-[#62677F]">
                        {maxLocationVotes} {maxLocationVotes === 1 ? 'voto cada una' : 'votos cada una'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#15172A]">
                        Hay un empate entre {winningLocationOptions.map((o) => `"${o.text}"`).join(' y ')}
                      </h4>
                      <p className="text-xs text-[#62677F] mt-0.5 leading-relaxed">
                        Estas opciones tienen la misma cantidad de votos. Seguí votando para desempatar y definir el lugar preferido.
                      </p>
                    </div>
                  </motion.div>
                ) : singleWinningLocation ? (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-blue-500/10 border border-[#FF2EB5]/30 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF2EB5]/15 text-[#FF2EB5] border border-[#FF2EB5]/30 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#FF2EB5]" /> Lugar que va ganando
                      </span>
                      <span className="text-xs font-bold text-[#FF2EB5] bg-white px-2.5 py-0.5 rounded-lg border border-[#FF2EB5]/20 shadow-2xs">
                        {singleWinningLocation.voterIds.length} {singleWinningLocation.voterIds.length === 1 ? 'voto de la familia' : 'votos de la familia'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold text-[#15172A]">
                        {singleWinningLocation.text}
                      </h4>
                      {singleWinningLocation.address && (
                        <p className="text-xs text-[#62677F] flex items-center gap-1">
                          <span>📍 {singleWinningLocation.address}</span>
                        </p>
                      )}
                      {singleWinningLocation.note && (
                        <p className="text-xs text-[#62677F] italic">
                          💬 "{singleWinningLocation.note}"
                        </p>
                      )}
                      {singleWinningLocation.mapsUrl && (
                        <a
                          href={singleWinningLocation.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#287BFF] hover:underline pt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ver en Google Maps</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </>
            )}

            {/* List of Location Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#15172A] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF2EB5]" />
                  Opciones para votar ({meeting.locationOptions.length}):
                </span>
                <span className="text-[#62677F] text-[11px]">Toca para votar</span>
              </div>

              {meeting.locationOptions.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2 bg-[#F7F8FF]/50">
                  <MapPin className="w-8 h-8 text-[#FF2EB5]/50 mx-auto" />
                  <p className="text-xs font-bold text-[#15172A]">
                    No se definieron opciones de lugar para este encuentro
                  </p>
                  <p className="text-[11px] text-[#62677F] max-w-xs mx-auto">
                    Las opciones de lugar se configuran durante la creación del encuentro.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {meeting.locationOptions.map((opt) => {
                    const hasVoted = opt.voterIds.includes(currentMember.id);
                    const isWinning =
                      opt.voterIds.length > 0 &&
                      maxLocationVotes === opt.voterIds.length &&
                      !isLocationTie;

                    return (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          hasVoted
                            ? 'border-[#FF2EB5] bg-[#FF2EB5]/5 ring-1 ring-[#FF2EB5]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleVote('location', opt.id)}
                            className="flex-1 text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-[#15172A]">{opt.text}</span>
                              {isWinning && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center gap-1 border border-[#FF2EB5]/20">
                                  <Award className="w-3 h-3" /> Va ganando
                                </span>
                              )}
                              {isLocationTie && winningLocationOptions.some((w) => w.id === opt.id) && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                                  <Vote className="w-3 h-3" /> Empate
                                </span>
                              )}
                            </div>

                            {opt.address && (
                              <p className="text-[11px] text-[#62677F] mt-1 flex items-center gap-1">
                                <span>📍 {opt.address}</span>
                              </p>
                            )}

                            {opt.note && (
                              <p className="text-[11px] text-[#62677F] italic mt-0.5">
                                💬 "{opt.note}"
                              </p>
                            )}

                            {opt.mapsUrl && (
                              <a
                                href={opt.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#287BFF] hover:underline mt-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Ver en Google Maps</span>
                              </a>
                            )}

                            {opt.suggestedByName && (
                              <div className="flex items-center gap-2 text-[10px] text-[#62677F] mt-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 font-medium">
                                  Propuesto por: <strong>{opt.suggestedByName}</strong>
                                </span>
                              </div>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVote('location', opt.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                              hasVoted
                                ? 'bg-[#FF2EB5] text-white shadow-xs'
                                : 'bg-white text-[#FF2EB5] border border-[#FF2EB5]/40 hover:bg-[#FF2EB5]/10'
                            }`}
                          >
                            {hasVoted ? '✓ Mi voto' : 'Votar'}
                          </button>
                        </div>

                        {/* Voters avatars & winning confirm action */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {opt.voterIds.map((vId) => {
                                const vMember = activeFamily.members.find((m) => m.id === vId);
                                return (
                                  <div
                                    key={vId}
                                    className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-1 ring-white"
                                    style={{ backgroundColor: vMember?.avatarColor || '#FF2EB5' }}
                                    title={vMember?.name}
                                  >
                                    {vMember?.name.charAt(0)}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-[11px] text-[#62677F] font-semibold">
                              {opt.voterIds.length} {opt.voterIds.length === 1 ? 'voto' : 'votos'}
                            </span>
                          </div>

                          {currentMember.role === 'admin' && meeting.locationConfirmed !== opt.text && (
                            <button
                              type="button"
                              onClick={() => handleConfirmOption('location', opt.text)}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer"
                            >
                              Confirmar este lugar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asistencia (RSVP) Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#287BFF]" />
              <h2 className="text-lg font-bold text-[#15172A] font-brand">
                Asistencia de la familia
              </h2>
            </div>
            <span className="text-xs font-bold text-[#287BFF]">
              {confirmedRSVPs.length} Confirmados
            </span>
          </div>

          {/* Current user interactive RSVP button group */}
          <div className="bg-[#F7F8FF] p-4 rounded-2xl border border-[#287BFF]/15 space-y-2">
            <p className="text-xs font-bold text-[#15172A]">Tu respuesta (Mai):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="rsvp-voy-btn"
                type="button"
                onClick={() => handleRSVP('voy')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentUserRsvp === 'voy'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Voy</span>
              </button>

              <button
                id="rsvp-quizas-btn"
                type="button"
                onClick={() => handleRSVP('quizas')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentUserRsvp === 'quizas'
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Quizás</span>
              </button>

              <button
                id="rsvp-no-voy-btn"
                type="button"
                onClick={() => handleRSVP('no_voy')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  currentUserRsvp === 'no_voy'
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                    : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>No voy</span>
              </button>
            </div>
          </div>

          {/* Breakdown lists */}
          <div className="space-y-3 text-xs">
            {/* Confirmados */}
            <div>
              <p className="font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmados ({confirmedRSVPs.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {confirmedRSVPs.map((r) => {
                  const m = activeFamily.members.find((mem) => mem.id === r.memberId);
                  return (
                    <span key={r.memberId} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      {m?.name || 'Integrante'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quizás */}
            {maybeRSVPs.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Pendientes / Quizás ({maybeRSVPs.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {maybeRSVPs.map((r) => {
                    const m = activeFamily.members.find((mem) => mem.id === r.memberId);
                    return (
                      <span key={r.memberId} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                        {m?.name || 'Integrante'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No asistirán */}
            {declinedRSVPs.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="font-bold text-red-700 mb-1.5 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> No asistirán ({declinedRSVPs.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {declinedRSVPs.map((r) => {
                    const m = activeFamily.members.find((mem) => mem.id === r.memberId);
                    return (
                      <span key={r.memberId} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 font-semibold border border-red-200">
                        {m?.name || 'Integrante'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Organización / Tareas: "¿Qué lleva o hace cada persona?" */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#287BFF]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#15172A] font-brand">
                ¿Qué lleva o hace cada persona?
              </h2>
            </div>
            <p className="text-xs text-[#62677F] mt-0.5">
              Organización de comidas, bebidas, reservas y elementos compartidos.
            </p>
          </div>

          <button
            id="add-task-open-btn"
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#287BFF]/10 text-[#287BFF] hover:bg-[#287BFF]/20 text-xs font-bold transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar tarea</span>
          </button>
        </div>

        {/* Inline Add Task Box */}
        {isAddingTask && (
          <div className="p-4 rounded-2xl bg-[#F7F8FF] border border-[#287BFF]/30 space-y-3 animate-in fade-in">
            <p className="text-xs font-bold text-[#15172A]">Nueva tarea o elemento:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ej. Llevar cubiertos descartables, Comprar hielo..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF]"
                autoFocus
              />
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF]"
              >
                <option value="">Asignar a... (opcional)</option>
                {activeFamily.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#62677F] hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                className="px-4 py-1.5 rounded-lg bg-[#287BFF] text-white text-xs font-bold hover:bg-[#1a6beb]"
              >
                Guardar tarea
              </button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2.5">
          {meeting.tasks.map((task) => {
            const assignedMember = activeFamily.members.find((m) => m.id === task.assignedMemberId);
            const isEditing = editingTaskId === task.id;

            if (isEditing) {
              return (
                <div key={task.id} className="p-3.5 rounded-2xl bg-white border border-[#287BFF] shadow-xs space-y-2">
                  <input
                    type="text"
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-[#15172A]"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={editingTaskAssignee}
                      onChange={(e) => setEditingTaskAssignee(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-[#15172A]"
                    >
                      <option value="">Sin asignar</option>
                      {activeFamily.members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTaskId(null)}
                        className="px-2 py-1 text-xs text-[#62677F]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditTask(task.id)}
                        className="px-3 py-1 bg-[#287BFF] text-white text-xs font-bold rounded-lg"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                  task.completed ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-emerald-600 text-white' : 'border border-gray-300 hover:border-[#287BFF]'
                    }`}
                    aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <p className={`text-xs sm:text-sm font-semibold ${
                      task.completed ? 'line-through text-[#62677F]' : 'text-[#15172A]'
                    }`}>
                      {task.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {assignedMember ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F8FF] border border-gray-200">
                      <div
                        className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                        style={{ backgroundColor: assignedMember.avatarColor || '#287BFF' }}
                      >
                        {assignedMember.name.charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold text-[#15172A]">
                        {assignedMember.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#62677F] italic px-2 py-0.5 rounded-full bg-gray-100">
                      Sin asignar
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setEditingTaskTitle(task.title);
                      setEditingTaskAssignee(task.assignedMemberId || '');
                    }}
                    className="p-1 text-[#62677F] hover:text-[#15172A]"
                    title="Editar tarea"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sección: Recuerdos de este encuentro */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#FF2EB5]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#15172A] font-brand">
                Recuerdos de este encuentro
              </h2>
            </div>
            <p className="text-xs text-[#62677F] mt-0.5">
              Fotografías, momentos especiales y anécdotas compartidas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="open-add-memory-modal-btn"
              onClick={() => setShowAddMemoryModal(true)}
              className="px-4 py-2 rounded-xl gradient-salcie-btn text-xs font-bold text-white shadow-sm flex items-center gap-1.5 hover:scale-102 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar recuerdos</span>
            </button>

            <button
              id="open-drive-album-btn"
              onClick={() => setShowDriveModal(true)}
              className="px-4 py-2 rounded-xl bg-white border border-[#287BFF]/30 text-[#287BFF] hover:bg-[#F7F8FF] text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Abrir álbum en Drive</span>
            </button>
          </div>
        </div>

        {meeting.memories && meeting.memories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {meeting.memories.map((mem) => (
              <div
                key={mem.id}
                className="bg-[#F7F8FF] rounded-2xl overflow-hidden border border-gray-200/70 shadow-xs card-hover-effect flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-gray-100 overflow-hidden relative">
                    <img src={mem.photoUrl} alt={mem.caption || 'Recuerdo'} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    {mem.caption && (
                      <h4 className="text-sm font-bold text-[#15172A]">{mem.caption}</h4>
                    )}
                    {mem.anecdote && (
                      <p className="text-xs text-[#62677F] italic leading-relaxed">
                        “{mem.anecdote}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between text-[11px] text-[#62677F] border-t border-gray-100 mt-2">
                  <span>Por <strong>{mem.authorName}</strong></span>
                  <span>{mem.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#F7F8FF] text-center border border-dashed border-gray-300">
            <Camera className="w-8 h-8 text-[#62677F] mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[#15172A]">Aún no hay fotos o anécdotas guardadas.</p>
            <p className="text-[11px] text-[#62677F] mt-1 mb-4">
              Agrega las fotos familiares y momentos divertidos para recordarlos siempre.
            </p>
            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="px-4 py-2 rounded-xl bg-white border border-[#FF2EB5]/30 text-[#FF2EB5] text-xs font-bold hover:bg-[#FF2EB5]/5 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guardar el primer recuerdo</span>
            </button>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="¿Eliminar encuentro?"
        message={`¿Estás seguro de que deseas eliminar "${meeting.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isDestructive={true}
        onConfirm={() => onDeleteMeeting(meeting.id)}
        onClose={() => setShowDeleteConfirm(false)}
      />

      {/* Drive Modal */}
      <DriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
      />

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={showAddMemoryModal}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        authorOptions={activeFamily.members.map((m) => m.name)}
        onClose={() => setShowAddMemoryModal(false)}
        onAdd={handleAddMemory}
      />

    </div>
  );
};
