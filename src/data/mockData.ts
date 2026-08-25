import { Family, Meeting } from '../types';

export const INITIAL_FAMILIES: Family[] = [
  {
    id: 'rivera',
    name: 'Familia Rivera',
    coverUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    creatorName: 'Mai',
    createdAt: '2026-01-10',
    members: [
      { id: 'm-mai', name: 'Mai', relation: 'Tú', role: 'admin', inviteStatus: 'accepted', isCurrentUser: true, avatarColor: '#FF2EB5' },
      { id: 'm-tomas', name: 'Tomás', relation: 'Hermano', role: 'member', inviteStatus: 'accepted', avatarColor: '#287BFF' },
      { id: 'm-ana', name: 'Ana', relation: 'Mamá', role: 'member', inviteStatus: 'accepted', avatarColor: '#8B5CFF' },
      { id: 'm-carlos', name: 'Carlos', relation: 'Papá', role: 'member', inviteStatus: 'accepted', avatarColor: '#00C8FF' },
      { id: 'm-lucia', name: 'Lucía', relation: 'Prima', role: 'member', inviteStatus: 'accepted', avatarColor: '#FF5C93' },
      { id: 'm-martin', name: 'Martín', relation: 'Tío', role: 'member', inviteStatus: 'accepted', avatarColor: '#10B981' },
      { id: 'm-sofia', name: 'Sofía', relation: 'Hermana', role: 'member', inviteStatus: 'accepted', avatarColor: '#F59E0B' },
    ]
  },
  {
    id: 'perez',
    name: 'Familia Pérez',
    coverUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
    creatorName: 'Mai',
    createdAt: '2026-03-05',
    members: [
      { id: 'm-mai-p', name: 'Mai', relation: 'Tú', role: 'admin', inviteStatus: 'accepted', isCurrentUser: true, avatarColor: '#FF2EB5' },
      { id: 'm-diego', name: 'Diego', relation: 'Primo', role: 'member', inviteStatus: 'accepted', avatarColor: '#287BFF' },
      { id: 'm-elena', name: 'Elena', relation: 'Tía', role: 'member', inviteStatus: 'accepted', avatarColor: '#8B5CFF' },
      { id: 'm-roberto', name: 'Roberto', relation: 'Abuelo', role: 'member', inviteStatus: 'accepted', avatarColor: '#10B981' },
    ]
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  // --- FAMILIA RIVERA ---
  {
    id: 'meet-rivera-1',
    familyId: 'rivera',
    title: 'Almuerzo familiar del domingo',
    type: 'comida',
    status: 'votacion',
    description: 'Una tarde para comer juntos, disfrutar de una rica comida y ponernos al día.',
    coverUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
    dateTimeOptions: [
      {
        id: 'dto-1',
        text: 'Domingo 30 de agosto a las 13:00',
        note: 'Opción con mayor preferencia hasta el momento',
        voterIds: ['m-mai', 'm-tomas', 'm-carlos', 'm-lucia']
      },
      {
        id: 'dto-2',
        text: 'Domingo 6 de septiembre a las 13:00',
        note: 'Fin de semana siguiente',
        voterIds: ['m-ana', 'm-martin']
      }
    ],
    locationOptions: [
      {
        id: 'lo-1',
        text: 'Casa de Ana',
        note: 'Patio amplio, sombra y parrilla lista para usar',
        voterIds: ['m-mai', 'm-ana', 'm-tomas', 'm-sofia']
      },
      {
        id: 'lo-2',
        text: 'Quinta Los Aromos',
        note: 'Espacio verde al aire libre con mesas y parque',
        voterIds: ['m-carlos', 'm-lucia']
      }
    ],
    invitedMemberIds: ['m-mai', 'm-tomas', 'm-ana', 'm-carlos', 'm-lucia', 'm-martin', 'm-sofia'],
    rsvps: [
      { memberId: 'm-mai', status: 'voy' },
      { memberId: 'm-tomas', status: 'voy' },
      { memberId: 'm-ana', status: 'voy' },
      { memberId: 'm-carlos', status: 'voy' },
      { memberId: 'm-lucia', status: 'voy' },
      { memberId: 'm-martin', status: 'quizas' },
      { memberId: 'm-sofia', status: 'no_voy' }
    ],
    tasks: [
      { id: 't-1', title: 'Llevar el postre (Tarta de frutillas)', assignedMemberId: 'm-mai', completed: false },
      { id: 't-2', title: 'Llevar las bebidas y hielo', assignedMemberId: 'm-tomas', completed: true },
      { id: 't-3', title: 'Comprar carne y carbón', assignedMemberId: 'm-carlos', completed: true },
      { id: 't-4', title: 'Preparar ensaladas variadas', assignedMemberId: 'm-ana', completed: false },
      { id: 't-5', title: 'Llevar juegos de cartas y música', assignedMemberId: 'm-lucia', completed: false }
    ],
    memories: [],
    createdAt: '2026-08-20'
  },
  {
    id: 'meet-rivera-2',
    familyId: 'rivera',
    title: 'Noche de juegos',
    type: 'celebracion',
    status: 'finalizado',
    description: 'Noche de pizzas caseras, juegos de mesa y muchas risas compartidas.',
    coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
    dateTimeConfirmed: '15 de julio a las 20:00',
    locationConfirmed: 'Casa de Tomás',
    locationAddress: 'Calle Los Olivos 240',
    dateTimeOptions: [],
    locationOptions: [],
    invitedMemberIds: ['m-mai', 'm-tomas', 'm-ana', 'm-carlos', 'm-lucia', 'm-martin'],
    rsvps: [
      { memberId: 'm-mai', status: 'voy' },
      { memberId: 'm-tomas', status: 'voy' },
      { memberId: 'm-ana', status: 'voy' },
      { memberId: 'm-carlos', status: 'voy' },
      { memberId: 'm-lucia', status: 'voy' },
      { memberId: 'm-martin', status: 'voy' }
    ],
    tasks: [
      { id: 't-201', title: 'Preparar masa para las pizzas', assignedMemberId: 'm-tomas', completed: true },
      { id: 't-202', title: 'Llevar tablero de TEG y cartas', assignedMemberId: 'm-carlos', completed: true },
      { id: 't-203', title: 'Llevar helado artesanal', assignedMemberId: 'm-mai', completed: true }
    ],
    memories: [
      {
        id: 'mem-1',
        meetingId: 'meet-rivera-2',
        photoUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80',
        caption: 'La final épica de TEG',
        anecdote: '¡La partida más divertida del año! Tomás no podía creer que Carlos le ganó en el último turno con una tirada de dados inolvidable.',
        authorName: 'Ana',
        createdAt: '2026-07-16'
      },
      {
        id: 'mem-2',
        meetingId: 'meet-rivera-2',
        photoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        caption: 'Pizzas listas al horno de barro',
        anecdote: 'Las pizzas caseras de Tomás quedaron increíbles. Ya estamos pidiendo revancha culinaria para la próxima.',
        authorName: 'Tomás',
        createdAt: '2026-07-16'
      },
      {
        id: 'mem-3',
        meetingId: 'meet-rivera-2',
        photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
        caption: 'Brindis por estar juntos',
        anecdote: 'Risas sin parar durante toda la noche. Un recuerdo hermoso de todos reunidos.',
        authorName: 'Mai',
        createdAt: '2026-07-16'
      }
    ],
    createdAt: '2026-07-01'
  },
  {
    id: 'meet-rivera-3',
    familyId: 'rivera',
    title: 'Cumpleaños de Carlos',
    type: 'cumpleanos',
    status: 'confirmado',
    description: 'Festejamos los 60 años de papá con toda la familia reunida y sorpresas.',
    coverUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=80',
    dateTimeConfirmed: '12 de octubre a las 19:30',
    locationConfirmed: 'Salón Las Lilas',
    locationAddress: 'Av. San Martín 1420',
    dateTimeOptions: [],
    locationOptions: [],
    invitedMemberIds: ['m-mai', 'm-tomas', 'm-ana', 'm-carlos', 'm-lucia', 'm-martin', 'm-sofia'],
    rsvps: [
      { memberId: 'm-mai', status: 'voy' },
      { memberId: 'm-tomas', status: 'voy' },
      { memberId: 'm-ana', status: 'voy' },
      { memberId: 'm-carlos', status: 'voy' },
      { memberId: 'm-lucia', status: 'voy' },
      { memberId: 'm-martin', status: 'voy' },
      { memberId: 'm-sofia', status: 'voy' }
    ],
    tasks: [
      { id: 't-301', title: 'Encargar la torta especial de chocolate', assignedMemberId: 'm-mai', completed: true },
      { id: 't-302', title: 'Decoración y guirnaldas', assignedMemberId: 'm-sofia', completed: false },
      { id: 't-303', title: 'Armar playlist con sus canciones favoritas', assignedMemberId: 'm-tomas', completed: true }
    ],
    memories: [],
    createdAt: '2026-08-10'
  },

  // --- FAMILIA PÉREZ ---
  {
    id: 'meet-perez-1',
    familyId: 'perez',
    title: 'Parrillada de fin de año',
    type: 'comida',
    status: 'finalizado',
    description: 'Encuentro para despedir el año con anécdotas y asado tradicional.',
    coverUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    dateTimeConfirmed: '30 de diciembre a las 13:00',
    locationConfirmed: 'Casa de Elena',
    locationAddress: 'Pasaje Los Ceibos 88',
    dateTimeOptions: [],
    locationOptions: [],
    invitedMemberIds: ['m-mai-p', 'm-diego', 'm-elena', 'm-roberto'],
    rsvps: [
      { memberId: 'm-mai-p', status: 'voy' },
      { memberId: 'm-diego', status: 'voy' },
      { memberId: 'm-elena', status: 'voy' },
      { memberId: 'm-roberto', status: 'voy' }
    ],
    tasks: [
      { id: 't-p1', title: 'Asado y achuras', assignedMemberId: 'm-diego', completed: true },
      { id: 't-p2', title: 'Ensaladas caseras', assignedMemberId: 'm-elena', completed: true }
    ],
    memories: [
      {
        id: 'mem-p1',
        meetingId: 'meet-perez-1',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        caption: 'Historias del abuelo Roberto',
        anecdote: 'El abuelo nos tuvo a todos atentos contando recuerdos de su juventud en el campo. Un tesoro familiar.',
        authorName: 'Diego',
        createdAt: '2025-12-31'
      }
    ],
    createdAt: '2025-12-15'
  },
  {
    id: 'meet-perez-2',
    familyId: 'perez',
    title: 'Paseo a la sierra',
    type: 'viaje',
    status: 'propuesta',
    description: 'Fin de semana de descanso, caminatas al aire libre y desconexión.',
    coverUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
    dateTimeOptions: [
      { id: 'dto-p1', text: 'Sábado 24 y Domingo 25 de Octubre', note: 'Buen pronóstico de sol', voterIds: ['m-mai-p', 'm-diego'] },
      { id: 'dto-p2', text: 'Sábado 7 y Domingo 8 de Noviembre', note: 'Más tiempo para planificar', voterIds: ['m-elena', 'm-roberto'] }
    ],
    locationOptions: [
      { id: 'lo-p1', text: 'Cabañas El Pinar', note: 'Con pileta climatizada y asador', voterIds: ['m-mai-p', 'm-elena', 'm-diego'] },
      { id: 'lo-p2', text: 'Posada del Sol', note: 'Cerca del río', voterIds: ['m-roberto'] }
    ],
    invitedMemberIds: ['m-mai-p', 'm-diego', 'm-elena', 'm-roberto'],
    rsvps: [
      { memberId: 'm-mai-p', status: 'voy' },
      { memberId: 'm-diego', status: 'voy' },
      { memberId: 'm-elena', status: 'quizas' },
      { memberId: 'm-roberto', status: 'voy' }
    ],
    tasks: [
      { id: 't-p201', title: 'Consultar tarifas y disponibilidad de cabañas', assignedMemberId: 'm-diego', completed: false },
      { id: 't-p202', title: 'Coordinar autos para viajar juntos', assignedMemberId: 'm-mai-p', completed: false }
    ],
    memories: [],
    createdAt: '2026-08-18'
  }
];

export const SAMPLE_MEMORY_PHOTOS = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80'
];

export const SAMPLE_FAMILY_COVERS = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'
];
