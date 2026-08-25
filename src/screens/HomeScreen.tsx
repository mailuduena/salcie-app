import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Vote, 
  CheckSquare, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Camera, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { ActiveScreen, Family, Meeting } from '../types';

interface HomeScreenProps {
  activeFamily: Family;
  meetings: Meeting[];
  onNavigate: (screen: ActiveScreen) => void;
  onSelectMeeting: (meetingId: string) => void;
  onOpenFamiliesScreen: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeFamily,
  meetings,
  onNavigate,
  onSelectMeeting,
  onOpenFamiliesScreen,
}) => {
  // Meetings specific to this active family
  const familyMeetings = meetings.filter((m) => m.familyId === activeFamily.id);
  
  // Upcoming meetings (votacion, propuesta, confirmado)
  const upcomingMeetings = familyMeetings.filter((m) => m.status !== 'finalizado');
  
  // Featured next meeting
  const featuredMeeting = upcomingMeetings[0];

  // Past meetings with memories
  const pastMeetings = familyMeetings.filter((m) => m.status === 'finalizado');
  const recentMemories = pastMeetings.flatMap((m) => m.memories).slice(0, 4);

  // Overall counts for summary stats
  const totalConfirmedGuests = featuredMeeting
    ? featuredMeeting.rsvps.filter((r) => r.status === 'voy').length
    : 0;

  const totalActivePolls = upcomingMeetings.filter((m) => m.status === 'votacion').length;
  
  const pendingTasks = upcomingMeetings.flatMap((m) => m.tasks).filter((t) => !t.completed);

  return (
    <div id="home-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      
      {/* Welcome Banner / Family Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#F0F4FF] p-6 sm:p-7 rounded-3xl border border-[#287BFF]/15 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF2EB5]/10 text-[#FF2EB5] text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Espacio familiar
            </span>
            <button
              onClick={onOpenFamiliesScreen}
              className="text-xs text-[#287BFF] font-semibold hover:underline"
            >
              Cambiar familia
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15172A] font-brand">
            Hola, Mai 👋
          </h1>
          <p className="text-sm text-[#62677F] mt-0.5">
            Organizando momentos únicos en <strong className="text-[#15172A] font-semibold">{activeFamily.name}</strong>
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            id="home-create-meeting-cta"
            onClick={() => onNavigate('create_meeting')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-salcie-btn text-sm font-bold shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Crear encuentro</span>
          </button>
        </div>
      </section>

      {/* Summary Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Confirmados */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#62677F] uppercase tracking-wider">Confirmados</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#15172A]">
              {totalConfirmedGuests} <span className="text-xs font-normal text-[#62677F]">personas</span>
            </p>
            <p className="text-[11px] text-[#62677F] mt-0.5">En el próximo encuentro</p>
          </div>
        </div>

        {/* Metric 2: Votaciones activas */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B5CFF]/10 text-[#8B5CFF] flex items-center justify-center shrink-0">
            <Vote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#62677F] uppercase tracking-wider">Votaciones</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#15172A]">
              {totalActivePolls} <span className="text-xs font-normal text-[#62677F]">activas</span>
            </p>
            <p className="text-[11px] text-[#62677F] mt-0.5">Fechas y lugares en debate</p>
          </div>
        </div>

        {/* Metric 3: Tareas pendientes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#62677F] uppercase tracking-wider">Tareas pendientes</p>
            <p className="text-xl sm:text-2xl font-extrabold text-[#15172A]">
              {pendingTasks.length} <span className="text-xs font-normal text-[#62677F]">por completar</span>
            </p>
            <p className="text-[11px] text-[#62677F] mt-0.5">Comidas, compras y reservas</p>
          </div>
        </div>
      </section>

      {/* Featured Next Meeting (Próximo encuentro destacado) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#287BFF]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#15172A] font-brand">
              Próximo encuentro destacado
            </h2>
          </div>
          {featuredMeeting && (
            <button
              onClick={() => onSelectMeeting(featuredMeeting.id)}
              className="text-xs font-bold text-[#287BFF] hover:text-[#1a6beb] flex items-center gap-1"
            >
              Ver detalle <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {featuredMeeting ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden border border-[#287BFF]/20 shadow-md flex flex-col lg:flex-row"
          >
            {/* Image Banner */}
            <div className="lg:w-2/5 relative h-52 lg:h-auto min-h-[220px] bg-gray-100">
              <img
                src={featuredMeeting.coverUrl || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80'}
                alt={featuredMeeting.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090B1A]/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#090B1A]/30" />
              
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#15172A] uppercase tracking-wider shadow-sm">
                  {featuredMeeting.type}
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4 lg:hidden">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  featuredMeeting.status === 'esperando_sugerencias'
                    ? 'bg-[#8B5CFF] text-white'
                    : featuredMeeting.status === 'votacion'
                    ? 'bg-[#8B5CFF] text-white'
                    : featuredMeeting.status === 'confirmado'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {featuredMeeting.status === 'esperando_sugerencias'
                    ? 'Esperando sugerencias'
                    : featuredMeeting.status === 'votacion'
                    ? 'En votación'
                    : featuredMeeting.status === 'confirmado'
                    ? 'Confirmado'
                    : 'Propuesta'}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="hidden lg:flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    featuredMeeting.status === 'esperando_sugerencias'
                      ? 'bg-[#8B5CFF]/15 text-[#8B5CFF]'
                      : featuredMeeting.status === 'votacion'
                      ? 'bg-[#8B5CFF]/15 text-[#8B5CFF]'
                      : featuredMeeting.status === 'confirmado'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {featuredMeeting.status === 'esperando_sugerencias'
                      ? '🕒 Esperando sugerencias de fecha'
                      : featuredMeeting.status === 'votacion'
                      ? '🗳️ En votación activa'
                      : featuredMeeting.status === 'confirmado'
                      ? '✅ Encuentro confirmado'
                      : '💡 Propuesta abierta'}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#15172A] font-brand leading-snug">
                  {featuredMeeting.title}
                </h3>
                <p className="text-sm text-[#62677F] mt-2 leading-relaxed">
                  {featuredMeeting.description}
                </p>

                {/* Key Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
                  
                  {/* Date info */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#62677F] uppercase tracking-wider">Fecha y hora</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#15172A]">
                        {featuredMeeting.dateTimeConfirmed || (
                          featuredMeeting.dateTimeOptions.length > 0 
                            ? `${featuredMeeting.dateTimeOptions.length} opciones en votación`
                            : 'A definir'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Location info */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#62677F] uppercase tracking-wider">Lugar</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#15172A]">
                        {featuredMeeting.locationConfirmed || (
                          featuredMeeting.locationOptions.length > 0
                            ? `${featuredMeeting.locationOptions.length} opciones propuestas`
                            : 'A definir'
                        )}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Confirmed people & Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {featuredMeeting.rsvps
                      .filter((r) => r.status === 'voy')
                      .slice(0, 5)
                      .map((r) => {
                        const member = activeFamily.members.find((m) => m.id === r.memberId);
                        return (
                          <div
                            key={r.memberId}
                            className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                            style={{ backgroundColor: member?.avatarColor || '#287BFF' }}
                            title={member?.name}
                          >
                            {member?.name.charAt(0) || 'U'}
                          </div>
                        );
                      })}
                  </div>
                  <span className="text-xs font-semibold text-[#62677F]">
                    {totalConfirmedGuests} personas confirmadas
                  </span>
                </div>

                <button
                  id="view-featured-meeting-btn"
                  onClick={() => onSelectMeeting(featuredMeeting.id)}
                  className="px-6 py-3 rounded-xl bg-[#15172A] hover:bg-[#287BFF] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Ver encuentro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-xs">
            <p className="text-[#62677F] text-sm mb-4">No hay próximos encuentros organizados para esta familia.</p>
            <button
              onClick={() => onNavigate('create_meeting')}
              className="px-5 py-2.5 rounded-xl gradient-salcie-btn text-sm font-bold text-white shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Organizar el primer encuentro</span>
            </button>
          </div>
        )}
      </section>

      {/* Grid: Próximos encuentros & Integrantes */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Próximos encuentros list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#15172A] font-brand">
              Próximos encuentros ({upcomingMeetings.length})
            </h2>
            <button
              onClick={() => onNavigate('meetings')}
              className="text-xs font-bold text-[#287BFF] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map((meet) => (
              <div
                key={meet.id}
                onClick={() => onSelectMeeting(meet.id)}
                className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-[#287BFF]/30 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 card-hover-effect"
              >
                <div className="flex items-center gap-3.5 truncate">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={meet.coverUrl} alt={meet.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-[#15172A] truncate">
                      {meet.title}
                    </h3>
                    <p className="text-xs text-[#62677F] mt-0.5">
                      {meet.dateTimeConfirmed || (meet.dateTimeOptions[0]?.text || 'En votación')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    meet.status === 'votacion' 
                      ? 'bg-[#8B5CFF]/10 text-[#8B5CFF]' 
                      : meet.status === 'confirmado'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {meet.status === 'votacion' ? 'Votación' : meet.status === 'confirmado' ? 'Confirmado' : 'Propuesta'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#62677F]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Integrantes de la familia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#15172A] font-brand">
              Integrantes ({activeFamily.members.length})
            </h2>
            <button
              onClick={() => onNavigate('family_members')}
              className="text-xs font-bold text-[#287BFF] hover:underline"
            >
              Administrar
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
            {activeFamily.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: member.avatarColor || '#287BFF' }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-[#15172A]">{member.name}</span>
                    {member.relation && (
                      <span className="text-[#62677F] ml-1.5 font-normal">({member.relation})</span>
                    )}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  member.role === 'admin' 
                    ? 'bg-[#FF2EB5]/10 text-[#FF2EB5]' 
                    : 'bg-gray-100 text-[#62677F]'
                }`}>
                  {member.role === 'admin' ? 'Admin' : 'Integrante'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Sección: Recuerdos recientes */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#FF2EB5]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#15172A] font-brand">
              Recuerdos recientes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('memories')}
            className="text-xs font-bold text-[#287BFF] hover:underline"
          >
            Ver álbum completo
          </button>
        </div>

        {recentMemories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentMemories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => onNavigate('memories')}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer card-hover-effect"
              >
                <div className="h-40 bg-gray-100 overflow-hidden relative">
                  <img src={mem.photoUrl} alt={mem.caption || 'Recuerdo'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090B1A]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-xs font-bold drop-shadow-sm truncate">{mem.caption || 'Momento compartido'}</p>
                    <p className="text-[10px] text-gray-200">Por {mem.authorName}</p>
                  </div>
                </div>
                {mem.anecdote && (
                  <div className="p-3.5">
                    <p className="text-xs text-[#62677F] italic line-clamp-2 leading-relaxed">
                      “{mem.anecdote}”
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-xs">
            <p className="text-xs text-[#62677F]">
              Los recuerdos de fotos y anécdotas aparecerán aquí a medida que finalicen los encuentros.
            </p>
          </div>
        )}
      </section>

    </div>
  );
};
