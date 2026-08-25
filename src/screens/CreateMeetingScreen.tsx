import React, { useState, useRef } from 'react';
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
  Edit3
} from 'lucide-react';
import { Family, Meeting, MeetingType, PollOption, MeetingTask } from '../types';
import { SAMPLE_MEMORY_PHOTOS } from '../data/mockData';
import { useToast } from '../components/ToastContext';

interface CreateMeetingScreenProps {
  activeFamily: Family;
  onCancel: () => void;
  onCreate: (meeting: Meeting) => void;
}

interface DateOptionItem {
  id: string;
  date: string;
  time: string;
  text: string;
}

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

  // Step 2: Date & Time (Real date & time pickers, Spanish formatting)
  const todayDateStr = new Date().toISOString().split('T')[0];
  const [dateMode, setDateMode] = useState<'fixed' | 'poll'>('poll');
  const [fixedDate, setFixedDate] = useState('');
  const [fixedTime, setFixedTime] = useState('13:00');
  const [isFixedDateConfirmed, setIsFixedDateConfirmed] = useState(false);
  const [fixedDateError, setFixedDateError] = useState('');
  
  // Alternatives for voting (empty by default so the organizer creates new proposals)
  const [dateOptions, setDateOptions] = useState<DateOptionItem[]>([]);
  const [newOptionDate, setNewOptionDate] = useState('');
  const [newOptionTime, setNewOptionTime] = useState('13:00');
  const [optionError, setOptionError] = useState('');

  // Step 3: Location
  const [locationMode, setLocationMode] = useState<'fixed' | 'poll'>('poll');
  const [fixedLocationName, setFixedLocationName] = useState('');
  const [fixedLocationAddress, setFixedLocationAddress] = useState('');
  const [locationOptions, setLocationOptions] = useState<string[]>([
    'Casa familiar',
    'Club o Quinta al aire libre'
  ]);
  const [newLocationOptionText, setNewLocationOptionText] = useState('');

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

  // Fixed Date & Time Handlers
  const handleFixedDateChange = (val: string) => {
    setFixedDate(val);
    setIsFixedDateConfirmed(false);
    if (val && val < todayDateStr) {
      setFixedDateError('Elegí una fecha de hoy en adelante.');
    } else {
      setFixedDateError('');
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.date;
      return copy;
    });
  };

  const handleFixedTimeChange = (val: string) => {
    setFixedTime(val);
    setIsFixedDateConfirmed(false);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.date;
      return copy;
    });
  };

  const handleConfirmFixedDateTime = () => {
    if (!fixedDate) {
      setFixedDateError('Por favor selecciona una fecha.');
      return;
    }
    if (!fixedTime) {
      setFixedDateError('Por favor selecciona un horario.');
      return;
    }
    if (fixedDate < todayDateStr) {
      setFixedDateError('Elegí una fecha de hoy en adelante.');
      return;
    }

    setFixedDateError('');
    setIsFixedDateConfirmed(true);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.date;
      return copy;
    });
    showToast('¡Fecha y horario confirmados!');
  };

  const handleEditFixedDateTime = () => {
    setIsFixedDateConfirmed(false);
  };

  const isConfirmButtonDisabled = !fixedDate || !fixedTime || fixedDate < todayDateStr;

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!title.trim()) newErrors.title = 'Ingresa el nombre del encuentro.';
    } else if (step === 2) {
      if (dateMode === 'fixed') {
        if (!isFixedDateConfirmed) {
          newErrors.date = 'Debes presionar "Confirmar fecha y horario" para continuar.';
        } else if (!fixedDate || !fixedTime) {
          newErrors.date = 'Debes seleccionar tanto la fecha como la hora confirmada.';
        } else if (fixedDate < todayDateStr) {
          newErrors.date = 'Elegí una fecha de hoy en adelante.';
        }
      }
      if (dateMode === 'poll' && dateOptions.length < 2) {
        newErrors.date = 'Debes agregar al menos dos opciones para la votación familiar.';
      }
    } else if (step === 3) {
      if (locationMode === 'fixed' && !fixedLocationName.trim()) {
        newErrors.location = 'Especifica el lugar confirmado.';
      }
      if (locationMode === 'poll' && locationOptions.length < 2) {
        newErrors.location = 'Agrega al menos 2 opciones de lugar para votar.';
      }
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

  // Date option helpers
  const handleAddDateOption = () => {
    if (!newOptionDate) {
      setOptionError('Selecciona una fecha para la opción.');
      return;
    }
    if (!newOptionTime) {
      setOptionError('Selecciona un horario para la opción.');
      return;
    }
    if (newOptionDate < todayDateStr) {
      setOptionError('Elegí una fecha de hoy en adelante.');
      return;
    }

    const formatted = formatSpanishDateTime(newOptionDate, newOptionTime);
    const newItem: DateOptionItem = {
      id: `dto-opt-${Date.now()}`,
      date: newOptionDate,
      time: newOptionTime,
      text: formatted,
    };

    setDateOptions([...dateOptions, newItem]);
    setNewOptionDate('');
    setOptionError('');
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.date;
      return copy;
    });
  };

  const handleRemoveDateOption = (index: number) => {
    setDateOptions(dateOptions.filter((_, i) => i !== index));
  };

  // Location option helpers
  const handleAddLocationOption = () => {
    if (newLocationOptionText.trim()) {
      setLocationOptions([...locationOptions, newLocationOptionText.trim()]);
      setNewLocationOptionText('');
      setErrors({});
    }
  };
  const handleRemoveLocationOption = (index: number) => {
    setLocationOptions(locationOptions.filter((_, i) => i !== index));
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
    const isPoll = dateMode === 'poll' || locationMode === 'poll';
    const finalStatus = isPoll ? 'votacion' : 'confirmado';

    const formattedDateOptions: PollOption[] = dateMode === 'poll' 
      ? dateOptions.map((opt, idx) => ({
          id: opt.id || `dto-new-${Date.now()}-${idx}`,
          text: opt.text,
          voterIds: []
        }))
      : [];

    const formattedLocationOptions: PollOption[] = locationMode === 'poll'
      ? locationOptions.map((text, idx) => ({
          id: `lo-new-${Date.now()}-${idx}`,
          text,
          voterIds: []
        }))
      : [];

    const formattedTasks: MeetingTask[] = tasks.map((t, idx) => ({
      id: `t-new-${Date.now()}-${idx}`,
      title: t.title,
      assignedMemberId: t.assignedMemberId,
      completed: false
    }));

    const confirmedDateText = dateMode === 'fixed' && isFixedDateConfirmed && fixedDate && fixedTime
      ? formatSpanishDateTime(fixedDate, fixedTime)
      : undefined;

    const newMeeting: Meeting = {
      id: `meet-${activeFamily.id}-${Date.now()}`,
      familyId: activeFamily.id,
      title: title.trim(),
      type,
      status: finalStatus,
      description: description.trim() || 'Encuentro familiar para compartir momentos juntos.',
      coverUrl: customCoverUrl.trim() || selectedCover || DEFAULT_COVERS_BY_TYPE[type] || SAMPLE_MEMORY_PHOTOS[0],
      dateTimeConfirmed: confirmedDateText,
      locationConfirmed: locationMode === 'fixed' ? fixedLocationName.trim() : undefined,
      locationAddress: locationMode === 'fixed' && fixedLocationAddress.trim() ? fixedLocationAddress.trim() : undefined,
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
              <p className="text-xs sm:text-sm text-[#62677F]">Elige si ya tienes una fecha fija o prefieres votar entre varias opciones con fechas reales.</p>
            </div>

            {/* Mode selection buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="mode-poll-date-btn"
                onClick={() => {
                  setDateMode('poll');
                  setIsFixedDateConfirmed(false);
                  setFixedDateError('');
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.date;
                    return copy;
                  });
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  dateMode === 'poll'
                    ? 'border-[#8B5CFF] bg-[#8B5CFF]/10 ring-1 ring-[#8B5CFF]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-bold text-[#15172A]">🗳️ Votación en familia</p>
                <p className="text-xs text-[#62677F] mt-1">Proponer opciones para que todos elijan</p>
              </button>

              <button
                type="button"
                id="mode-fixed-date-btn"
                onClick={() => {
                  setDateMode('fixed');
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.date;
                    return copy;
                  });
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  dateMode === 'fixed'
                    ? 'border-[#287BFF] bg-[#287BFF]/10 ring-1 ring-[#287BFF]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-bold text-[#15172A]">📅 Fecha confirmada</p>
                <p className="text-xs text-[#62677F] mt-1">Establecer un día y hora exactos</p>
              </button>
            </div>

            {/* Fixed Date Mode */}
            {dateMode === 'fixed' ? (
              isFixedDateConfirmed ? (
                /* Confirmed Card */
                <div className="bg-[#F7F8FF] p-4 sm:p-5 rounded-2xl border-2 border-[#287BFF]/30 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#287BFF]/10 text-[#287BFF] flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-[#287BFF]" />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#287BFF]/10 text-[#287BFF]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#287BFF]"></span>
                          Fecha y horario confirmados
                        </span>
                        <p className="text-sm sm:text-base font-bold text-[#15172A] mt-1 capitalize">
                          {formatSpanishDateOnly(fixedDate)}
                        </p>
                        <p className="text-xs font-semibold text-[#62677F] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#287BFF]" />
                          <span>{fixedTime} hs</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="edit-fixed-date-btn"
                      onClick={handleEditFixedDateTime}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#15172A] transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#287BFF]" />
                      <span>Editar fecha</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Fields & Confirmation Button */
                <div className="space-y-4 bg-[#F7F8FF] p-4 sm:p-5 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Calendar className="w-4 h-4 text-[#287BFF]" />
                    <span className="text-xs font-bold text-[#15172A]">Ingresar fecha y hora exacta</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="fixed-date-picker" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Selector de fecha <span className="text-[#FF2EB5]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="fixed-date-picker"
                          type="date"
                          min={todayDateStr}
                          value={fixedDate}
                          onChange={(e) => handleFixedDateChange(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="fixed-time-picker" className="block text-xs font-bold text-[#15172A] mb-1.5">
                        Selector de hora <span className="text-[#FF2EB5]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="fixed-time-picker"
                          type="time"
                          value={fixedTime}
                          onChange={(e) => handleFixedTimeChange(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {fixedDateError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{fixedDateError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    id="confirm-fixed-date-btn"
                    onClick={handleConfirmFixedDateTime}
                    disabled={isConfirmButtonDisabled}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isConfirmButtonDisabled
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-[#287BFF] hover:bg-[#1a6beb] text-white shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar fecha y horario</span>
                  </button>
                </div>
              )
            ) : (
              /* Poll Mode (Votación en familia) */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#15172A]">
                      Opciones que proponés para que la familia vote:
                    </label>
                    <span className="text-[11px] font-medium text-[#62677F]">
                      {dateOptions.length} {dateOptions.length === 1 ? 'opción' : 'opciones'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#62677F] mt-0.5">
                    Después de crear el encuentro, cada integrante podrá votar una de estas opciones.
                  </p>
                </div>

                {/* List of current poll options with formatted text and delete button */}
                <div className="space-y-2">
                  {dateOptions.map((opt, i) => (
                    <div 
                      key={opt.id || i} 
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F7F8FF] border border-gray-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#8B5CFF]/15 text-[#8B5CFF] font-bold text-xs flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-bold text-[#15172A] truncate">
                            {opt.text}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#62677F]">
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3 h-3 text-[#8B5CFF]" /> {opt.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-[#287BFF]" /> {opt.time} hs
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDateOption(i)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                        aria-label={`Eliminar opción ${i + 1}`}
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {dateOptions.length === 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <p className="text-xs text-amber-800 font-medium">
                        Todavía no agregaste ninguna opción.
                      </p>
                    </div>
                  )}
                </div>

                {/* Form to add a new alternative option */}
                <div className="p-4 rounded-2xl bg-[#F7F8FF] border border-gray-200 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#287BFF]" />
                    <span className="text-xs font-bold text-[#15172A]">Agregar nueva alternativa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="new-poll-date-picker" className="block text-[11px] font-bold text-[#62677F] mb-1">
                        Fecha <span className="text-[#FF2EB5]">*</span>
                      </label>
                      <input
                        id="new-poll-date-picker"
                        type="date"
                        min={todayDateStr}
                        value={newOptionDate}
                        onChange={(e) => {
                          setNewOptionDate(e.target.value);
                          setOptionError('');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF]"
                      />
                    </div>

                    <div>
                      <label htmlFor="new-poll-time-picker" className="block text-[11px] font-bold text-[#62677F] mb-1">
                        Hora <span className="text-[#FF2EB5]">*</span>
                      </label>
                      <input
                        id="new-poll-time-picker"
                        type="time"
                        value={newOptionTime}
                        onChange={(e) => {
                          setNewOptionTime(e.target.value);
                          setOptionError('');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-[#15172A] bg-white focus:outline-none focus:border-[#287BFF] focus:ring-1 focus:ring-[#287BFF]"
                      />
                    </div>
                  </div>

                  {/* Formatted live preview if both date and time chosen */}
                  {newOptionDate && newOptionTime && (
                    <div className="p-2.5 rounded-lg bg-white border border-[#8B5CFF]/20 text-[11px] flex items-center justify-between">
                      <span className="text-[#62677F]">Vista previa:</span>
                      <strong className="text-[#15172A] font-bold">
                        {formatSpanishDateTime(newOptionDate, newOptionTime)}
                      </strong>
                    </div>
                  )}

                  {optionError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{optionError}</span>
                    </p>
                  )}

                  <button
                    type="button"
                    id="add-date-option-btn"
                    onClick={handleAddDateOption}
                    className="w-full py-2.5 rounded-xl bg-[#287BFF] hover:bg-[#1a6beb] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar opción a la votación</span>
                  </button>
                </div>
              </div>
            )}

            {errors.date && (
              <p className="text-xs text-red-500 flex items-center gap-1 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.date}</span>
              </p>
            )}
          </motion.div>
        )}

        {/* Step 3: Lugar */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <span className="text-xs font-bold text-[#FF2EB5] uppercase tracking-wider">Paso 3 de 6</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#15172A] font-brand">Lugar del encuentro</h2>
              <p className="text-xs sm:text-sm text-[#62677F]">Elige si ya tienes un lugar listo o deseas abrir votación.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocationMode('poll')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  locationMode === 'poll'
                    ? 'border-[#8B5CFF] bg-[#8B5CFF]/10 ring-1 ring-[#8B5CFF]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-bold text-[#15172A]">🗳️ Votación de lugares</p>
                <p className="text-xs text-[#62677F] mt-1">Elegir entre varias opciones de lugar</p>
              </button>

              <button
                type="button"
                onClick={() => setLocationMode('fixed')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  locationMode === 'fixed'
                    ? 'border-[#287BFF] bg-[#287BFF]/10 ring-1 ring-[#287BFF]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-bold text-[#15172A]">📍 Lugar confirmado</p>
                <p className="text-xs text-[#62677F] mt-1">Ubicación ya acordada</p>
              </button>
            </div>

            {locationMode === 'fixed' ? (
              <div className="space-y-3">
                <div>
                  <label htmlFor="fixed-location-name-input" className="block text-xs font-bold text-[#15172A] mb-1">
                    Nombre del lugar <span className="text-[#FF2EB5]">*</span>
                  </label>
                  <input
                    id="fixed-location-name-input"
                    type="text"
                    value={fixedLocationName}
                    onChange={(e) => setFixedLocationName(e.target.value)}
                    placeholder="Ej. Casa de Ana, Restaurante La Estancia..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
                  />
                </div>
                <div>
                  <label htmlFor="fixed-location-addr-input" className="block text-xs font-bold text-[#15172A] mb-1">
                    Dirección o referencia <span className="text-xs font-normal text-[#62677F]">(Opcional)</span>
                  </label>
                  <input
                    id="fixed-location-addr-input"
                    type="text"
                    value={fixedLocationAddress}
                    onChange={(e) => setFixedLocationAddress(e.target.value)}
                    placeholder="Ej. Calle Los Olivos 240, Barrio San Carlos"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#15172A]">
                  Opciones de lugares para votar:
                </label>

                <div className="space-y-2">
                  {locationOptions.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F7F8FF] border border-gray-200 text-xs font-medium text-[#15172A]">
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocationOption(i)}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        aria-label="Eliminar opción de lugar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLocationOptionText}
                    onChange={(e) => setNewLocationOptionText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocationOption())}
                    placeholder="Ej. Quinta Los Aromos, Parque Centenario..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#15172A] bg-[#F7F8FF] focus:bg-white focus:outline-none focus:border-[#287BFF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocationOption}
                    className="px-3.5 py-2 rounded-xl bg-[#287BFF] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#1a6beb]"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </div>
            )}

            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
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
                  <p className="font-semibold text-[#15172A]">
                    {dateMode === 'fixed' 
                      ? (isFixedDateConfirmed && fixedDate && fixedTime ? formatSpanishDateTime(fixedDate, fixedTime) : 'Fecha no confirmada')
                      : `🗳️ Votación (${dateOptions.length} opciones)`}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="font-bold text-[#62677F] uppercase text-[10px] flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-[#FF2EB5]" /> Lugar
                  </p>
                  <p className="font-semibold text-[#15172A]">
                    {locationMode === 'fixed' ? fixedLocationName : `🗳️ Votación (${locationOptions.length} opciones)`}
                  </p>
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
              disabled={currentStep === 2 && dateMode === 'fixed' && !isFixedDateConfirmed}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-sm ${
                currentStep === 2 && dateMode === 'fixed' && !isFixedDateConfirmed
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-[#287BFF] hover:bg-[#1a6beb] text-white cursor-pointer'
              }`}
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
