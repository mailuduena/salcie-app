export type MeetingType = 
  | 'comida' 
  | 'salida' 
  | 'cumpleanos' 
  | 'celebracion' 
  | 'viaje' 
  | 'otro';

export type MeetingStatus = 
  | 'propuesta' 
  | 'votacion' 
  | 'confirmado' 
  | 'finalizado';

export type MemberRole = 'admin' | 'member';

export type RSVPStatus = 'voy' | 'quizas' | 'no_voy';

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  avatarColor?: string;
  relation?: string;
  role: MemberRole;
  inviteStatus: 'accepted' | 'pending';
  isCurrentUser?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  note?: string;
  voterIds: string[];
}

export interface RSVPResponse {
  memberId: string;
  status: RSVPStatus;
  updatedAt?: string;
}

export interface MeetingTask {
  id: string;
  title: string;
  assignedMemberId?: string;
  completed: boolean;
}

export interface Memory {
  id: string;
  meetingId: string;
  photoUrl: string;
  caption?: string;
  anecdote?: string;
  authorName: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  familyId: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  description: string;
  coverUrl?: string;
  // If confirmed or single choice
  dateTimeConfirmed?: string;
  locationConfirmed?: string;
  locationAddress?: string;
  // Polls
  dateTimeOptions: PollOption[];
  locationOptions: PollOption[];
  // Participants & RSVPs
  invitedMemberIds: string[];
  rsvps: RSVPResponse[];
  // Organization
  tasks: MeetingTask[];
  // Memories
  memories: Memory[];
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  coverUrl: string;
  creatorName: string;
  createdAt: string;
  members: FamilyMember[];
}

export type ActiveScreen = 
  | 'welcome' 
  | 'login' 
  | 'families' 
  | 'home' 
  | 'meetings' 
  | 'meeting_detail' 
  | 'create_meeting' 
  | 'memories' 
  | 'family_members';

export interface AppState {
  currentScreen: ActiveScreen;
  activeFamilyId: string;
  selectedMeetingId?: string;
  selectedMemoryMeetingId?: string;
  meetingsFilter: {
    tab: 'proximos' | 'pasados';
    year: string;
    type: string;
  };
}
