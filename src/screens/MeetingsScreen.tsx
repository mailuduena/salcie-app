import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Camera, 
  Filter, 
  Plus, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Family, Meeting, MeetingType } from '../types';

interface MeetingsScreenProps {
  activeFamily: Family;
  meetings: Meeting[];
  onSelectMeeting: (meetingId: string) => void;
  onCreateMeeting: () => void;
}

export const MeetingsScreen: React.FC<MeetingsScreenProps> = ({
  activeFamily,
  meetings,
  onSelectMeeting,
  onCreateMeeting,
}) => {
  const [tab, setTab] = useState<'proximos' | 'pasados'>('proximos');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Filter meetings by active family
  const familyMeetings = meetings.filter((m) => m.familyId === activeFamily.id);

  // Filter by tab
  const filteredByTab = familyMeetings.filter((m) => {
    if (tab === 'proximos') return m.status !== 'finalizado';
    return m.status === 'finalizado';
  });

  // Filter by type & year
  const finalMeetings = filteredByTab.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (yearFilter !== 'all') {
      const year = m.createdAt.split('-')[0];
      if (year !== yearFilter) return false;
    }
    return true;
  });

  const availableYears = Array.from(
    new Set(familyMeetings.map((m) => m.createdAt.split('-')[0]))
  );

  return (
    <div id="meetings-screen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#287BFF] uppercase tracking-wider">
              {activeFamily.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15172A] font-brand">
            Historial de encuentros
          </h1>
          <p className="text-xs sm:text-sm text-[#62677F] mt-0.5">
            Explora las próximas reuniones y revive los momentos compartidos.
          </p>
        </div>

        <button
          id="meetings-screen-create-btn"
          onClick={onCreateMeeting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold shadow-md shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Crear encuentro</span>
        </button>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Próximos / Pasados Tabs */}
        <div className="flex items-center bg-[#F7F8FF] p-1 rounded-xl border border-gray-200">
          <button
            id="tab-proximos-btn"
            onClick={() => setTab('proximos')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === 'proximos'
                ? 'bg-white text-[#287BFF] shadow-xs'
                : 'text-[#62677F] hover:text-[#15172A]'
            }`}
          >
            Próximos encuentros ({familyMeetings.filter((m) => m.status !== 'finalizado').length})
          </button>
          <button
            id="tab-pasados-btn"
            onClick={() => setTab('pasados')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === 'pasados'
                ? 'bg-white text-[#FF2EB5] shadow-xs'
                : 'text-[#62677F] hover:text-[#15172A]'
            }`}
          >
            Encuentros pasados ({familyMeetings.filter((m) => m.status === 'finalizado').length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#62677F]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold hidden sm:inline">Filtrar:</span>
          </div>

          {/* Type Filter */}
          <select
            id="type-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#15172A] bg-[#F7F8FF] focus:outline-none focus:border-[#287BFF]"
          >
            <option value="all">Todos los tipos</option>
            <option value="comida">Comidas</option>
            <option value="salida">Salidas</option>
            <option value="cumpleanos">Cumpleaños</option>
            <option value="celebracion">Celebraciones</option>
            <option value="viaje">Viajes</option>
            <option value="otro">Otros</option>
          </select>

          {/* Year Filter */}
          <select
            id="year-filter-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-[#15172A] bg-[#F7F8FF] focus:outline-none focus:border-[#287BFF]"
          >
            <option value="all">Todos los años</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Meetings Grid */}
      {finalMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalMeetings.map((meet, idx) => {
            const confirmedCount = meet.rsvps.filter((r) => r.status === 'voy').length;
            const memoriesCount = meet.memories?.length || 0;

            return (
              <motion.div
                key={meet.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all card-hover-effect flex flex-col justify-between"
              >
                <div>
                  {/* Card Banner */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={meet.coverUrl || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'}
                      alt={meet.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090B1A]/80 via-transparent to-transparent" />

                    {/* Type Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#15172A] uppercase tracking-wider shadow-xs">
                        {meet.type}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        meet.status === 'votacion'
                          ? 'bg-[#8B5CFF] text-white'
                          : meet.status === 'confirmado'
                          ? 'bg-emerald-500 text-white'
                          : meet.status === 'finalizado'
                          ? 'bg-[#287BFF] text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {meet.status === 'votacion' ? 'Votación' : meet.status === 'confirmado' ? 'Confirmado' : meet.status === 'finalizado' ? 'Finalizado' : 'Propuesta'}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold font-brand drop-shadow-sm line-clamp-1">
                        {meet.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-[#62677F] line-clamp-2 leading-relaxed">
                      {meet.description}
                    </p>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-[#15172A]">
                        <Calendar className="w-3.5 h-3.5 text-[#287BFF] shrink-0" />
                        <span className="font-semibold line-clamp-1">
                          {meet.dateTimeConfirmed || (meet.dateTimeOptions[0]?.text || 'Fecha a definir')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[#15172A]">
                        <MapPin className="w-3.5 h-3.5 text-[#FF2EB5] shrink-0" />
                        <span className="font-semibold line-clamp-1">
                          {meet.locationConfirmed || (meet.locationOptions[0]?.text || 'Lugar a definir')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#62677F] pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#287BFF]" />
                        <span><strong>{confirmedCount}</strong> confirmados</span>
                      </div>

                      {memoriesCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[#FF2EB5] font-semibold">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{memoriesCount} recuerdos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  <button
                    id={`view-meeting-${meet.id}-btn`}
                    onClick={() => onSelectMeeting(meet.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F7F8FF] hover:bg-[#287BFF] text-[#15172A] hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-gray-200 hover:border-transparent"
                  >
                    <span>{tab === 'pasados' ? 'Ver recuerdos y detalle' : 'Ver encuentro'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto space-y-3">
          <Calendar className="w-12 h-12 text-[#62677F] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#15172A]">No hay encuentros para mostrar</h3>
          <p className="text-xs text-[#62677F]">
            {tab === 'proximos' 
              ? 'No tienes reuniones programadas actualmente con los filtros seleccionados.' 
              : 'Los encuentros finalizados aparecerán aquí con sus recuerdos fotográficos.'}
          </p>
          {tab === 'proximos' && (
            <button
              onClick={onCreateMeeting}
              className="px-5 py-2.5 rounded-xl gradient-salcie-btn text-xs font-bold text-white shadow-md inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear encuentro</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};
