import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckSquare, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Check, 
  Info, 
  Clock, 
  Sparkles, 
  FileCheck,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  X,
  Edit3,
  Vote,
  ExternalLink
} from 'lucide-react';
import { Family, Meeting, MeetingType, PollOption, MeetingTask, MeetingStatus } from '../types';
import { SAMPLE_MEMORY_PHOTOS } from '../data/mockData';
import { useToast } from '../components/ToastContext';

interface CreateMeetingScreenProps {
  activeFamily: Family;
  onCancel: () => void;
  onCreate: (meeting: Meeting) => void;
}

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

// Utility to format date into readable Spanish text
function formatSpanishDateOnly(dateStr: string): string {
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
  return `${weekday} ${day} de ${monthName}`;
}

// Utility to format date and time into a readable Spanish string
function formatSpanishDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  // Local date object to avoid UTC timezone offset shifts
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

const MEETING_TYPES: { id: MeetingType; label: string; iconText: string }[] = [
  { id: 'comida', label: 'Comida / Asado', iconText: '🍽️' },
  { id: 'salida', label: 'Salida / Paseo', iconText: '🌳' },
  { id: 'cumpleanos', label: 'Cumpleaños', iconText: '🎂' },
  { id: 'celebracion', label: 'Celebración', iconText: '🎉' },
  { id: 'viaje', label: 'Viaje / Escapada', iconText: '🚗' },
  { id: 'otro', label: 'Otro encuentro', iconText: '✨' },
];

const DEFAULT_COVERS_BY_TYPE: Record<MeetingType, string> = {
  comida: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
  salida: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
  cumpleanos: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
  celebracion: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
  viaje: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
  otro: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80',
};

const SUGGESTED_TASKS = [
  'Llevar las bebidas y hielo',
  'Llevar el postre',
  'Preparar ensaladas',
  'Comprar carne y carbón',
  'Reservar el lugar / mesa',
  'Llevar juegos de mesa',
  'Sacar fotos familiares',
];

/**
 * Utility to process, resize (max 1600px on longest side) and compress (quality 0.75)
 * images before saving them into state and localStorage.
 */
function processAndCompressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Validation: Max 10MB before compression
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      reject(new Error('La imagen supera los 10 MB antes de la compresión. Por favor elige una imagen menor a 10 MB.'));
      return;
    }

    // 2. Validation: format (JPG, JPEG, PNG, WEBP)
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const lowerName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => lowerName.endsWith(ext));
    const hasValidMime = validMimes.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

    if (!hasValidMime && !hasValidExt) {
      reject(new Error('El archivo seleccionado no es una imagen compatible (únicamente JPG, JPEG, PNG y WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de la imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
      img.onload = () => {
        try {
          const maxDimension = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo inicializar el procesador gráfico en tu navegador.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(new Error('Error al redimensionar y procesar la fotografía.'));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const CreateMeetingScreen: React.FC<CreateMeetingScreenProps> = ({
  activeFamily,
  onCancel,
  onCreate,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Info
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MeetingType>('comida');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(SAMPLE_MEMORY_PHOTOS[4]);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Step 2: Date & Time (Spanish formatting, collaborative mode)
  const todayDateStr = new Date().toISOString().split('T')[0];
  
  // Initial date suggestion by organizer in collaborative mode (optional)
  const [initialSuggestion, setInitialSuggestion] = useState<{
    day: string;
    month: string;
    year: string;
    date: string;
    time: string;
    text: string;
  } | null>(null);
  const [sugDay, setSugDay] = useState('');
  const [sugMonth, setSugMonth] = useState('');
  const [sugYear, setSugYear] = useState(CURRENT_YEAR.toString());
  const [sugDate, setSugDate] = useState('');
  const [sugTime, setSugTime] = useState('13:00');
  const [sugError, setSugError] = useState('');

  // Compute valid days in selected month for initial suggestion
  const daysInSelectedMonthForSug = useMemo(() => {
    if (!sugMonth || !sugYear) return 31;
    const monthNum = parseInt(sugMonth, 10);
    const yearNum = parseInt(sugYear, 10);
    return new Date(yearNum, monthNum, 0).getDate();
  }, [sugMonth, sugYear]);

  const dayOptionsForSug = useMemo(() => {
    return Array.from({ length: daysInSelectedMonthForSug }, (_, i) => {
      const d = i + 1;
      return d < 10 ? `0${d}` : `${d}`;
    });
  }, [daysInSelectedMonthForSug]);

  // Step 3: Location (collaborative mode)
  const [initialLocationSuggestion, setInitialLocationSuggestion] = useState<{
    name: string;
    address?: string;
    note?: string;
    mapsUrl?: string;
  } | null>(null);
  const [sugLocName, setSugLocName] = useState('');
  const [sugLocAddress, setSugLocAddress] = useState('');
  const [sugLocNote, setSugLocNote] = useState('');
  const [sugLocMapsUrl, setSugLocMapsUrl] = useState('');
  const [sugLocError, setSugLocError] = useState('');

  // Identify Mai (organizer) vs other family members
  const organizer = activeFamily.members.find(
    (m) => m.isCurrentUser || m.id === 'm-mai' || m.name.toLowerCase() === 'mai'
  ) || activeFamily.members[0];

  const otherFamilyMembers = activeFamily.members.filter(
    (m) => m.id !== organizer.id
  );

  // Step 4: Guests (Only other family members are in selectable list)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    otherFamilyMembers.map((m) => m.id)
  );

  // Step 5: Tasks & Organization
  const [tasks, setTasks] = useState<{ title: string; assignedMemberId?: string }[]>([
    { title: 'Llevar bebidas y hielo', assignedMemberId: otherFamilyMembers[0]?.id || activeFamily.members[1]?.id },
    { title: 'Llevar el postre', assignedMemberId: organizer.id }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Image Upload Handlers
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    setIsProcessingImage(true);

    try {
      const processedBase64 = await processAndCompressImage(file);
      setCustomCoverUrl(processedBase64);
      setImageError('');
      showToast('¡Foto cargada y optimizada!');
    } catch (err: any) {
      setImageError(err.message || 'No se pudo procesar la imagen.');
    } finally {
      setIsProcessingImage(false);
      // Reset input value so user can re-select the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCustomImage = () => {
    setCustomCoverUrl('');
    setImageError('');
    if (!selectedCover) {
      setSelectedCover(DEFAULT_COVERS_BY_TYPE[type] || SAMPLE_MEMORY_PHOTOS[0]);
    }
  };

  // Initial Date Suggestion Handlers
  const updateSugDateFromParts = (d: string, m: string, y: string) => {
    setSugError('');
    if (d && m && y) {
      const monthNum = parseInt(m, 10);
      const yearNum = parseInt(y, 10);
      const maxDays = new Date(yearNum, monthNum, 0).getDate();
      let validDay = d;
      if (parseInt(d, 10) > maxDays) {
        validDay = maxDays < 10 ? `0${maxDays}` : `${maxDays}`;
        setSugDay(validDay);
      }
      const fullDateStr = `${y}-${m.padStart(2, '0')}-${validDay.padStart(2, '0')}`;
      setSugDate(fullDateStr);
      if (fullDateStr < todayDateStr) {
        setSugError('Elegí una fecha de hoy en adelante.');
      } else {
        setSugError('');
      }
    } else {
      setSugDate('');
      setSugError('');
    }
  };

  const handleSugDaySelect = (val: string) => {
    setSugDay(val);
    updateSugDateFromParts(val, sugMonth, sugYear);
  };

  const handleSugMonthSelect = (val: string) => {
    setSugMonth(val);
    updateSugDateFromParts(sugDay, val, sugYear);
  };

  const handleSugYearSelect = (val: string) => {
    setSugYear(val);
    updateSugDateFromParts(sugDay, sugMonth, val);
  };

  const handleSugTimeChange = (val: string) => {
    setSugTime(val);
    setSugError('');
  };

  const handleAddInitialSuggestion = () => {
    setSugError('');
    if (!sugDay || !sugMonth || !sugYear || !sugDate) {
      setSugError('Por favor selecciona día, mes y año.');
      return;
    }
    if (!sugTime) {
      setSugError('Por favor selecciona un horario.');
      return;
    }
    if (sugDate < todayDateStr) {
      setSugError('Elegí una fecha de hoy en adelante.');
      return;
    }

    const formatted = formatSpanishDateTime(sugDate, sugTime);
    setInitialSuggestion({
      day: sugDay,
      month: sugMonth,
      year: sugYear,
      date: sugDate,
      time: sugTime,
      text: formatted,
    });
    setSugError('');
    showToast('¡Tu sugerencia fue agregada con éxito!');
  };

  const handleEditInitialSuggestion = () => {
    if (initialSuggestion) {
      setSugDay(initialSuggestion.day);
      setSugMonth(initialSuggestion.month);
      setSugYear(initialSuggestion.year);
      setSugDate(initialSuggestion.date);
      setSugTime(initialSuggestion.time);
      setInitialSuggestion(null);
      setSugError('');
    }
  };

  const handleRemoveInitialSuggestion = () => {
    setInitialSuggestion(null);
    setSugDay('');
    setSugMonth('');
    setSugYear(CURRENT_YEAR.toString());
    setSugDate('');
    setSugTime('13:00');
    setSugError('');
    showToast('Sugerencia eliminada.');
  };

  const isAddSugDisabled = !sugDay || !sugMonth || !sugYear || !sugDate || !sugTime || sugDate < todayDateStr;

  // Initial Location Suggestion Handlers
  const handleAddInitialLocationSuggestion = () => {
    setSugLocError('');
    if (!sugLocName.trim()) {
      setSugLocError('Por favor ingresa el nombre del lugar.');
      return;
    }

    setInitialLocationSuggestion({
      name: sugLocName.trim(),
      address: sugLocAddress.trim() || undefined,
      note: sugLocNote.trim() || undefined,
      mapsUrl: sugLocMapsUrl.trim() || undefined,
    });
    setSugLocName('');
    setSugLocAddress('');
    setSugLocNote('');
    setSugLocMapsUrl('');
    setSugLocError('');
    showToast('¡Tu sugerencia de lugar fue agregada con éxito!');
  };

  const handleEditInitialLocationSuggestion = () => {
    if (initialLocationSuggestion) {
      setSugLocName(initialLocationSuggestion.name);
      setSugLocAddress(initialLocationSuggestion.address || '');
      setSugLocNote(initialLocationSuggestion.note || '');
      setSugLocMapsUrl(initialLocationSuggestion.mapsUrl || '');
      setInitialLocationSuggestion(null);
      setSugLocError('');
    }
  };

  const handleRemoveInitialLocationSuggestion = () => {
    setInitialLocationSuggestion(null);
    setSugLocName('');
    setSugLocAddress('');
    setSugLocNote('');
    setSugLocMapsUrl('');
    setSugLocError('');
    showToast('Sugerencia de lugar eliminada.');
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!title.trim()) newErrors.title = 'Ingresa el nombre del encuentro.';
    } else if (step === 4) {
      if (selectedMemberIds.length === 0) {
        newErrors.guests = 'Selecciona al menos un invitado.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Guest helpers
  const toggleMemberSelection = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.guests;
      return copy;
    });
  };

  const handleToggleAllGuests = () => {
    if (selectedMemberIds.length === otherFamilyMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(otherFamilyMembers.map((m) => m.id));
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.guests;
      return copy;
    });
  };

  // Task helpers
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { title: newTaskTitle.trim(), assignedMemberId: newTaskAssignee || undefined }]);
      setNewTaskTitle('');
      setNewTaskAssignee('');
    }
  };
  const handleAddSuggestedTask = (suggested: string) => {
    if (!tasks.some((t) => t.title === suggested)) {
      setTasks([...tasks, { title: suggested }]);
    }
  };
  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Final Submit
  const handleFinalCreate = () => {
    const finalStatus: MeetingStatus = 'esperando_sugerencias';

    const formattedDateOptions: PollOption[] = initialSuggestion
      ? [
          {
            id: `dto-init-${Date.now()}`,
            text: initialSuggestion.text,
            voterIds: [],
            suggestedByMemberId: organizer.id,
            suggestedByName: organizer.name,
          }
        ]
      : [];

    const formattedLocationOptions: PollOption[] = initialLocationSuggestion
      ? [
          {
            id: `lo-init-${Date.now()}`,
            text: initialLocationSuggestion.name,
            address: initialLocationSuggestion.address,
            note: initialLocationSuggestion.note,
            mapsUrl: initialLocationSuggestion.mapsUrl,
            voterIds: [],
            suggestedByMemberId: organizer.id,
            suggestedByName: organizer.name,
          }
        ]
      : [];

    const formattedTasks: MeetingTask[] = tasks.map((t, idx) => ({
      id: `t-new-${Date.now()}-${idx}`,
      title: t.title,
      assignedMemberId: t.assignedMemberId,
      completed: false
    }));

    const newMeeting: Meeting = {
      id: `meet-${activeFamily.id}-${Date.now()}`,
      familyId: activeFamily.id,
      title: title.trim(),
      type,
      status: finalStatus,
      description: description.trim() || 'Encuentro familiar para compartir momentos juntos.',
      coverUrl: customCoverUrl.trim() || selectedCover || DEFAULT_COVERS_BY_TYPE[type] || SAMPLE_MEMORY_PHOTOS[0],
      dateTimeConfirmed: undefined,
      locationConfirmed: undefined,
      locationAddress: undefined,
      dateTimeOptions: formattedDateOptions,
      locationOptions: formattedLocationOptions,
      invitedMemberIds: selectedMemberIds,
      rsvps: [
        { memberId: organizer.id, status: 'voy' },
        ...selectedMemberIds.map((mId) => ({
          memberId: mId,
          status: 'quizas' as const
        }))
      ],
      tasks: formattedTasks,
      memories: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    onCreate(newMeeting);
    showToast('¡Encuentro creado exitosamente!');
  };

  const stepsList = [
    { num: 1, label: 'Información' },
    { num: 2, label: 'Fecha' },
    { num: 3, label: 'Lugar' },
    { num: 4, label: 'Invitados' },
    { num: 5, label: 'Tareas' },
    { num: 6, label: 'Revisión' },
  ];

  return (
    <div id="create-meeting-screen" className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Header & Back */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="cancel-create-meeting-top-btn"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#62677F] hover:text-[#15172A] p-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar</span>
        </button>

        <span className="text-xs font-bold text-[#62677F]">
          Creando en: <strong className="text-[#287BFF] font-bold">{activeFamily.name}</strong>
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-6">
        <div className="flex items-center justify-between">
          {stepsList.map((st, i) => (
            <div key={st.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === st.num
                      ? 'bg-gradient-to-tr from-[#FF2EB5] to-[#287BFF] text-white shadow-md shadow-pink-500/20 ring-2 ring-pink-200'
                      : currentStep > st.num
                      ? 'bg-[#287BFF] text-white'
                      : 'bg-gray-100 text-[#62677F]'
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-4 h-4" /> : st.num}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1 font-medium hidden sm:block ${
                  currentStep === st.num ? 'text-[#15172A] font-bold' : 'text-[#62677F]'
                }`}>
                  {st.label}
                </span>
              </div>
              {i < stepsList.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 sm:mx-2 ${
                  currentStep > st.num ? 'bg-[#287BFF]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#287BFF]/15 shadow-md min-h-[420px] flex flex-col justify-between">
        
        {/* Step 1: Información */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 1 de 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Información del encuentro</h2>
              <p className="text-xs sm:text-sm text-[#62677F]">Define el motivo y tipo de reunión familiar.</p>
            </div>

            <div>
              <label htmlFor="meeting-title-input" className="block text-xs font-bold text-[#15172A] mb-1.5">
                Nombre del encuentro <span className="text-[#FF2EB5]">*</span>
              </label>
              <input
                id="meeting-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Asado del domingo, Festejo de cumpleaños..."
                className={`w-full px-4 py-3 rounded-xl border text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none transition-colors ${
                  errors.title ? 'border-red-500' : 'border-gray-200 focus:border-[#287BFF]'
                }`}
                autoFocus
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#15172A] mb-1.5">
                Tipo de encuentro
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {MEETING_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id);
                      if (!customCoverUrl) {
                        setSelectedCover(DEFAULT_COVERS_BY_TYPE[t.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      type === t.id
                        ? 'border-[#287BFF] bg-[#287BFF]/8 ring-1 ring-[#287BFF] font-bold text-[#15172A]'
                        : 'border-gray-200 hover:border-gray-300 text-[#62677F]'
                    }`}
                  >
                    <span className="text-lg">{t.iconText}</span>
                    <span className="text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="meeting-desc-input" className="block text-xs font-bold text-[#15172A] mb-1.5">
                Descripción <span className="text-xs font-normal text-[#62677F]">(Opcional)</span>
              </label>
              <textarea
                id="meeting-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Agrega notas o detalles importantes para la familia..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF] transition-colors resize-none"
              />
            </div>

            {/* Foto de portada */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#15172A]">
                  Foto de portada
                </label>
                {customCoverUrl && (
                  <span className="text-[11px] font-bold text-[#287BFF] bg-[#287BFF]/10 px-2.5 py-0.5 rounded-full">
                    Foto personalizada activa
                  </span>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                id="meeting-cover-upload-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleImageFileChange}
              />

              {/* Upload Button or Custom Photo Preview */}
              {customCoverUrl ? (
                <div className="rounded-2xl border-2 border-[#287BFF] bg-[#F7F8FF] p-3 space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video sm:aspect-21/9 max-h-48 w-full bg-gray-100">
                    <img
                      src={customCoverUrl}
                      alt="Previsualización de portada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#FF2EB5]" />
                      Tu foto personalizada
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      id="change-custom-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#287BFF] hover:bg-[#287BFF]/10 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cambiar foto</span>
                    </button>

                    <button
                      type="button"
                      id="remove-custom-photo-btn"
                      onClick={handleRemoveCustomImage}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="upload-cover-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed border-[#287BFF]/40 bg-[#287BFF]/5 hover:bg-[#287BFF]/10 text-[#287BFF] transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#287BFF]/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-[#287BFF]" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-[#15172A]">
                      {isProcessingImage ? 'Procesando y optimizando imagen...' : 'Subir mi propia foto'}
                    </p>
                    <p className="text-[11px] text-[#62677F]">
                      Acepta JPG, JPEG, PNG y WEBP (Máx. 10 MB)
                    </p>
                  </div>
                </button>
              )}

              {/* Error Alert */}
              {imageError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p>{imageError}</p>
                </div>
              )}

              {/* Sample Photos as Quick Options */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-[#62677F]">
                  O elige una fotografía de muestra:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {SAMPLE_MEMORY_PHOTOS.slice(0, 6).map((img, i) => {
                    const isSelected = selectedCover === img && !customCoverUrl;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedCover(img);
                          setCustomCoverUrl('');
                          setImageError('');
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                          isSelected
                            ? 'border-[#FF2EB5] ring-2 ring-pink-300 scale-102 shadow-xs'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:scale-101'
                        }`}
                      >
                        <img src={img} alt={`Muestra ${i + 1}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#FF2EB5]/35 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow-sm" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Demo note */}
              <p className="text-[11px] text-[#62677F] flex items-center gap-1 pt-1">
                <Info className="w-3.5 h-3.5 text-[#62677F] shrink-0" />
                <span>En esta demo, la imagen se guarda solamente en este dispositivo.</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Fecha y horario */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 2 de 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Fecha y horario</h2>
              <p className="text-xs sm:text-sm text-[#62677F]">Las fechas se coordinan y votan entre todos los integrantes de la familia.</p>
            </div>

            {/* Collaborative Dates Single Flow */}
            <div className="space-y-4">
              {/* Informative Explanation Panel */}
              <div className="bg-[#F7F8FF] p-5 sm:p-6 rounded-2xl border border-[#8B5CFF]/30 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#8B5CFF]/15 text-[#8B5CFF] flex items-center justify-center shrink-0">
                    <Vote className="w-6 h-6 text-[#8B5CFF]" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8B5CFF]/15 text-[#8B5CFF]">
                      A definir en familia
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#15172A]">
                      Sugerir fechas en familia
                    </h3>
                    <p className="text-xs sm:text-sm text-[#62677F] leading-relaxed">
                      Cada integrante podrá sugerir fechas. Cuando todos terminen, la familia votará y ganará la opción con más votos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-gray-200">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-[#15172A]">
                    <span className="w-6 h-6 rounded-full bg-[#8B5CFF]/15 text-[#8B5CFF] font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <span className="font-medium">Creás el encuentro</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-[#15172A]">
                    <span className="w-6 h-6 rounded-full bg-[#287BFF]/15 text-[#287BFF] font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <span className="font-medium">La familia sugiere fechas</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-[#15172A]">
                    <span className="w-6 h-6 rounded-full bg-[#FF2EB5]/15 text-[#FF2EB5] font-bold text-xs flex items-center justify-center shrink-0">3</span>
                    <span className="font-medium">Votan y gana la más elegida</span>
                  </div>
                </div>
              </div>

              {/* Section: Tu primera sugerencia */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-[#15172A] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#287BFF]" />
                      Tu primera sugerencia
                    </h3>
                    <span className="text-[11px] font-semibold text-[#62677F] bg-gray-100 px-2 py-0.5 rounded-md">
                      Opcional
                    </span>
                  </div>
                  <p className="text-xs text-[#62677F] mt-1 leading-relaxed">
                    Podés proponer una fecha ahora. Los demás integrantes podrán sumar otras después de creado el encuentro.
                  </p>
                </div>

                {initialSuggestion ? (
                  /* Tarjeta con la sugerencia agregada */
                  <div className="bg-[#F7F8FF] p-4 rounded-xl border border-[#287BFF]/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-[#287BFF]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#15172A] truncate capitalize">
                          {initialSuggestion.text}
                        </p>
                        <p className="text-[11px] font-semibold text-[#287BFF] flex items-center gap-1 mt-0.5">
                          <span>Sugerida por {organizer.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleEditInitialSuggestion}
                        id="edit-organizer-sug-btn"
                        className="p-2 rounded-lg text-[#62677F] hover:text-[#287BFF] hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        title="Editar sugerencia"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveInitialSuggestion}
                        id="remove-organizer-sug-btn"
                        className="p-2 rounded-lg text-[#62677F] hover:text-red-500 hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        title="Eliminar sugerencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Formulario de selectores */
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Fecha propuesta
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          id="sug-day-select"
                          value={sugDay}
                          onChange={(e) => handleSugDaySelect(e.target.value)}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF] transition-all cursor-pointer"
                        >
                          <option value="">Día</option>
                          {dayOptionsForSug.map((d) => (
                            <option key={d} value={d}>
                              {parseInt(d, 10)}
                            </option>
                          ))}
                        </select>

                        <select
                          id="sug-month-select"
                          value={sugMonth}
                          onChange={(e) => handleSugMonthSelect(e.target.value)}
                          className="w-full px-2 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF] transition-all cursor-pointer"
                        >
                          <option value="">Mes</option>
                          {MONTHS_SPANISH.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>

                        <select
                          id="sug-year-select"
                          value={sugYear}
                          onChange={(e) => handleSugYearSelect(e.target.value)}
                          className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF] transition-all cursor-pointer"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y.toString()}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sug-time-picker" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Horario
                      </label>
                      <input
                        id="sug-time-picker"
                        type="time"
                        value={sugTime}
                        onChange={(e) => handleSugTimeChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF] transition-all"
                      />
                    </div>

                    {sugError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{sugError}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      id="add-organizer-sug-btn"
                      onClick={handleAddInitialSuggestion}
                      disabled={isAddSugDisabled}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        isAddSugDisabled
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-[#287BFF] hover:bg-[#1a6beb] text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar mi sugerencia</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Lugar */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 3 de 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Lugar del encuentro</h2>
              <p className="text-xs sm:text-sm text-[#62677F]">Los lugares se coordinan y votan entre todos los integrantes de la familia.</p>
            </div>

            {/* Collaborative Location Single Flow */}
            <div className="space-y-4">
              {/* Informative Explanation Panel */}
              <div className="bg-[#F7F8FF] p-5 sm:p-6 rounded-2xl border border-[#FF2EB5]/30 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FF2EB5]/15 text-[#FF2EB5] flex items-center justify-center shrink-0">
                    <Vote className="w-6 h-6 text-[#FF2EB5]" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF2EB5]/15 text-[#FF2EB5]">
                      A definir en familia
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#15172A]">
                      Sugerir lugares en familia
                    </h3>
                    <p className="text-xs sm:text-sm text-[#62677F] leading-relaxed">
                      Cada integrante podrá sugerir lugares. Cuando todos terminen, la familia votará y ganará la opción con más votos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-gray-200">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-[#15172A]">
                    <span className="w-6 h-6 rounded-full bg-[#FF2EB5]/15 text-[#FF2EB5] font-bold text-xs flex items-center justify-center shrink-0">1</span>
                    <span className="font-medium">Creás el encuentro</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-[#15172A]">
                    <span className="w-6 h-6 rounded-full bg-[#8B5CFF]/15 text-[#8B5CFF] font-bold text-xs flex items-center justify-center shrink-0">2</span>
                    <span className="font-medium">La familia sugiere lugares</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center gap-2.5 text-xs text-[#15172A]">
                    <span className="w-6 h-6 rounded-full bg-[#287BFF]/15 text-[#287BFF] font-bold text-xs flex items-center justify-center shrink-0">3</span>
                    <span className="font-medium">Votan y gana el más elegido</span>
                  </div>
                </div>
              </div>

              {/* Section: Tu primera sugerencia */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-[#15172A] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF2EB5]" />
                      Tu primera sugerencia
                    </h3>
                    <span className="text-[11px] font-semibold text-[#62677F] bg-gray-100 px-2 py-0.5 rounded-md">
                      Opcional
                    </span>
                  </div>
                  <p className="text-xs text-[#62677F] mt-1 leading-relaxed">
                    Podés proponer un lugar ahora. Los demás integrantes podrán sumar otros después de creado el encuentro.
                  </p>
                </div>

                {initialLocationSuggestion ? (
                  /* Tarjeta con la sugerencia agregada */
                  <div className="bg-[#F7F8FF] p-4 rounded-xl border border-[#FF2EB5]/30 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-[#FF2EB5]" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-[#15172A] truncate">
                          {initialLocationSuggestion.name}
                        </p>
                        {initialLocationSuggestion.address && (
                          <p className="text-xs text-[#62677F] flex items-center gap-1">
                            <span className="truncate">📍 {initialLocationSuggestion.address}</span>
                          </p>
                        )}
                        {initialLocationSuggestion.note && (
                          <p className="text-xs text-[#62677F] italic">
                            💬 "{initialLocationSuggestion.note}"
                          </p>
                        )}
                        {initialLocationSuggestion.mapsUrl && (
                          <a
                            href={initialLocationSuggestion.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#287BFF] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ver en Google Maps</span>
                          </a>
                        )}
                        <p className="text-[11px] font-semibold text-[#FF2EB5] flex items-center gap-1 pt-0.5">
                          <span>Sugerido por {organizer.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleEditInitialLocationSuggestion}
                        id="edit-organizer-loc-sug-btn"
                        className="p-2 rounded-lg text-[#62677F] hover:text-[#FF2EB5] hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        title="Editar sugerencia de lugar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveInitialLocationSuggestion}
                        id="remove-organizer-loc-sug-btn"
                        className="p-2 rounded-lg text-[#62677F] hover:text-red-500 hover:bg-white border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                        title="Eliminar sugerencia de lugar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Formulario de campos para el lugar */
                  <div className="space-y-3 pt-1">
                    <div>
                      <label htmlFor="sug-loc-name-input" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Nombre del lugar <span className="text-[#FF2EB5]">*</span>
                      </label>
                      <input
                        id="sug-loc-name-input"
                        type="text"
                        value={sugLocName}
                        onChange={(e) => {
                          setSugLocName(e.target.value);
                          setSugLocError('');
                        }}
                        placeholder="Ej. Casa de Ana, Restaurante La Estancia, Club..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#FF2EB5] focus:ring-1 focus:ring-[#FF2EB5] transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="sug-loc-address-input" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Dirección o ubicación <span className="text-[11px] font-normal text-[#62677F]">(Opcional)</span>
                      </label>
                      <input
                        id="sug-loc-address-input"
                        type="text"
                        value={sugLocAddress}
                        onChange={(e) => setSugLocAddress(e.target.value)}
                        placeholder="Ej. Calle Los Olivos 240, Barrio San Carlos..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#FF2EB5] focus:ring-1 focus:ring-[#FF2EB5] transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="sug-loc-note-input" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Nota o detalle <span className="text-[11px] font-normal text-[#62677F]">(Opcional)</span>
                      </label>
                      <input
                        id="sug-loc-note-input"
                        type="text"
                        value={sugLocNote}
                        onChange={(e) => setSugLocNote(e.target.value)}
                        placeholder="Ej. Tiene mesas afuera, hay que reservar..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#FF2EB5] focus:ring-1 focus:ring-[#FF2EB5] transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="sug-loc-maps-input" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Enlace de Google Maps <span className="text-[11px] font-normal text-[#62677F]">(Opcional)</span>
                      </label>
                      <input
                        id="sug-loc-maps-input"
                        type="url"
                        value={sugLocMapsUrl}
                        onChange={(e) => setSugLocMapsUrl(e.target.value)}
                        placeholder="Ej. https://maps.app.goo.gl/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#FF2EB5] focus:ring-1 focus:ring-[#FF2EB5] transition-all"
                      />
                    </div>

                    {sugLocError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{sugLocError}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      id="add-organizer-loc-sug-btn"
                      onClick={handleAddInitialLocationSuggestion}
                      disabled={!sugLocName.trim()}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        !sugLocName.trim()
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-[#FF2EB5] hover:bg-[#e0209e] text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar mi sugerencia</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Invitados */}
        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 4 de 6</span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Invitados</h2>
                <p className="text-xs sm:text-sm text-[#62677F]">Selecciona qué familiares asistirán o recibirán la propuesta.</p>
              </div>

              {otherFamilyMembers.length > 0 && (
                <button
                  type="button"
                  id="toggle-all-guests-btn"
                  onClick={handleToggleAllGuests}
                  className="text-xs font-bold text-[#287BFF] hover:underline"
                >
                  {selectedMemberIds.length === otherFamilyMembers.length ? 'Deseleccionar todos' : 'Invitar a todos'}
                </button>
              )}
            </div>

            {/* Sección destacada de la organizadora (Mai) */}
            <div className="bg-[#FFF5FA] border border-[#FF2EB5]/30 p-4 rounded-2xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[#FF2EB5]/30"
                    style={{ backgroundColor: organizer.avatarColor || '#FF2EB5' }}
                  >
                    {organizer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#15172A]">{organizer.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF2EB5]/15 text-[#FF2EB5]">
                        Tú
                      </span>
                    </div>
                    <p className="text-xs text-[#FF2EB5] font-semibold flex items-center gap-1 mt-0.5">
                      Organizadora · Incluida automáticamente
                    </p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-xl bg-[#FF2EB5]/10 text-[#FF2EB5] text-[11px] font-bold shrink-0">
                  Confirmada
                </div>
              </div>
            </div>

            {/* Lista seleccionable únicamente de los demás integrantes de la familia */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#15172A]">
                Seleccionar integrantes a invitar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {otherFamilyMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMemberSelection(member.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? 'border-[#287BFF] bg-[#287BFF]/8 ring-1 ring-[#287BFF]'
                          : 'border-gray-200 hover:border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                          style={{ backgroundColor: member.avatarColor || '#287BFF' }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#15172A]">{member.name}</p>
                          {member.relation && (
                            <p className="text-[11px] text-[#62677F]">{member.relation}</p>
                          )}
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-[#287BFF] text-white' : 'border border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumen dinámico debajo de la lista: "X invitados + vos" */}
            <div className="p-3.5 rounded-xl bg-[#F7F8FF] border border-gray-200 flex items-center justify-between">
              <span className="text-xs text-[#62677F] font-medium">Asistencia proyectada:</span>
              <span className="text-xs font-bold text-[#15172A] bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-2xs">
                {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'invitado' : 'invitados'} + vos
              </span>
            </div>

            {errors.guests && <p className="text-xs text-red-500">{errors.guests}</p>}
          </motion.div>
        )}

        {/* Step 5: Organización / Tareas */}
        {currentStep === 5 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 5 de 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Organización de tareas</h2>
              <p className="text-xs sm:text-sm text-[#62677F]">Reparte responsabilidades: bebidas, ensaladas, postres, juegos...</p>
            </div>

            {/* Quick suggested pills */}
            <div>
              <p className="text-[11px] font-bold text-[#62677F] uppercase tracking-wider mb-2">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TASKS.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddSuggestedTask(sug)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FF] hover:bg-[#ebedff] border border-gray-200 text-[11px] font-medium text-[#15172A] transition-colors"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Active task list */}
            <div className="space-y-2">
              {tasks.map((task, idx) => {
                const assignedMember = activeFamily.members.find((m) => m.id === task.assignedMemberId);
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8FF] border border-gray-200">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-[#287BFF]" />
                      <span className="text-xs font-medium text-[#15172A]">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {assignedMember ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[#15172A]">
                          {assignedMember.name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#62677F] italic">Sin asignar</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add task inline */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nueva tarea (ej. Llevar parlante Bluetooth)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
              />
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
              >
                <option value="">Asignar a... (opcional)</option>
                {activeFamily.members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 rounded-xl bg-[#15172A] text-white text-xs font-bold hover:bg-[#232742]"
              >
                Agregar
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 6: Revisión y Confirmación */}
        {currentStep === 6 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 6 de 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Revisión del encuentro</h2>
              <p className="text-xs sm:text-sm text-[#62677F]">Verifica los datos antes de publicar el encuentro en la familia.</p>
            </div>

            {/* Summary Review Card */}
            <div className="bg-[#F7F8FF] rounded-2xl p-5 border border-[#287BFF]/20 space-y-4">
              
              <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF2EB5]/10 text-[#FF2EB5]">
                    {type}
                  </span>
                  <h3 className="text-lg font-bold text-[#15172A] mt-1">{title}</h3>
                  {description && <p className="text-xs text-[#62677F] mt-0.5">{description}</p>}
                </div>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                  <img src={customCoverUrl || selectedCover || DEFAULT_COVERS_BY_TYPE[type] || SAMPLE_MEMORY_PHOTOS[0]} alt={title} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Date & Location Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="font-bold text-[#62677F] uppercase text-[10px] flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-[#287BFF]" /> Fecha y hora
                  </p>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#15172A]">Fecha a definir en familia</p>
                    <p className="text-xs text-[#62677F]">
                      {initialSuggestion ? (
                        <>
                          Primera sugerencia:{' '}
                          <span className="font-semibold text-[#15172A] capitalize">
                            {initialSuggestion.text}
                          </span>{' '}
                          · por {organizer.name}
                        </>
                      ) : (
                        'Todavía no hay fechas sugeridas.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="font-bold text-[#62677F] uppercase text-[10px] flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-[#FF2EB5]" /> Lugar
                  </p>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#15172A]">Lugar a definir en familia</p>
                    <p className="text-xs text-[#62677F]">
                      {initialLocationSuggestion ? (
                        <>
                          Primera sugerencia:{' '}
                          <span className="font-semibold text-[#15172A]">
                            {initialLocationSuggestion.name}
                          </span>{' '}
                          · por {organizer.name}
                        </>
                      ) : (
                        'Todavía no hay lugares sugeridos.'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Guests & Attendance Breakdown */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[#62677F] flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#FF2EB5]"></span>
                    Organizadora:
                  </span>
                  <strong className="text-[#15172A] font-bold">{organizer.name}</strong>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[#62677F] flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#287BFF]"></span>
                    Invitados:
                  </span>
                  <strong className="text-[#15172A] font-bold">
                    {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'integrante' : 'integrantes'}
                  </strong>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[#15172A] font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#287BFF]" />
                    Total de asistentes previstos:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#287BFF]/10 text-[#287BFF] font-bold">
                    {selectedMemberIds.length + 1} {selectedMemberIds.length + 1 === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>

              {/* Tasks & Family */}
              <div className="flex flex-wrap items-center justify-between text-xs text-[#62677F] pt-2 border-t border-gray-200">
                <span>📋 <strong>{tasks.length}</strong> tareas organizadas</span>
                <span>🏠 Familia: <strong>{activeFamily.name}</strong></span>
              </div>

            </div>
          </motion.div>
        )}

        {/* Bottom Stepper Navigation Controls */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              id="wizard-prev-step-btn"
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-[#15172A] hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver y editar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-[#62677F] hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}

          {currentStep < 6 ? (
            <button
              id="wizard-next-step-btn"
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-sm bg-[#287BFF] hover:bg-[#1a6beb] text-white cursor-pointer"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="wizard-submit-create-meeting-btn"
              type="button"
              onClick={handleFinalCreate}
              className="px-7 py-3 rounded-xl gradient-salcie-btn text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all hover:scale-102 active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear encuentro</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
