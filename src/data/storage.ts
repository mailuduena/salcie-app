import { Family, FamilyMember, Meeting, MeetingStatus, MeetingTask, Memory, RSVPStatus } from '../types';
import { INITIAL_FAMILIES, INITIAL_MEETINGS } from './mockData';

const FAMILIES_KEY = 'salcie_families_v2';
const MEETINGS_KEY = 'salcie_meetings_v2';

export function getStoredFamilies(): Family[] {
  try {
    const raw = localStorage.getItem(FAMILIES_KEY);
    if (!raw) {
      // Check legacy v1 key and clean up
      localStorage.removeItem('salcie_families_v1');
      localStorage.setItem(FAMILIES_KEY, JSON.stringify(INITIAL_FAMILIES));
      return INITIAL_FAMILIES;
    }
    const parsed: Family[] = JSON.parse(raw);
    // Sanity check: Ensure rivera family has the updated members and relations
    const rivera = parsed.find(f => f.id === 'rivera');
    if (rivera) {
      const defaultRivera = INITIAL_FAMILIES.find(f => f.id === 'rivera')!;
      const hasOldMembers = rivera.members.some(m => ['m-tomas', 'm-ana', 'm-carlos', 'm-lucia', 'm-martin', 'm-sofia'].includes(m.id));
      const hasMissingMembers = !rivera.members.some(m => m.id === 'm-kev') || !rivera.members.some(m => m.id === 'm-lei');
      const hasOldRelations = rivera.members.some(m => {
        const def = defaultRivera.members.find(dm => dm.id === m.id);
        return def && def.relation !== m.relation;
      });

      if (hasOldMembers || hasMissingMembers || hasOldRelations) {
        const updated = parsed.map(f => {
          if (f.id === 'rivera') {
            // preserve any extra fields/status if same member, but update relation to match canonical
            const updatedMembers = defaultRivera.members.map(dm => {
              const existing = f.members.find(m => m.id === dm.id);
              return existing ? { ...existing, relation: dm.relation } : dm;
            });
            return { ...f, members: updatedMembers };
          }
          return f;
        });
        saveStoredFamilies(updated);
        return updated;
      }
    }
    return parsed;
  } catch (e) {
    console.error('Error loading families from localStorage', e);
    return INITIAL_FAMILIES;
  }
}

export function saveStoredFamilies(families: Family[]): void {
  try {
    localStorage.setItem(FAMILIES_KEY, JSON.stringify(families));
  } catch (e) {
    console.error('Error saving families to localStorage', e);
  }
}

export function getStoredMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(MEETINGS_KEY);
    if (!raw) {
      localStorage.removeItem('salcie_meetings_v1');
      localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    const parsed: Meeting[] = JSON.parse(raw);
    // If rivera meetings have obsolete members, reset or clean rivera meetings
    const hasOldRiveraMeeting = parsed.some(m => 
      m.familyId === 'rivera' && (
        m.invitedMemberIds.some(id => ['m-tomas', 'm-ana', 'm-carlos', 'm-lucia', 'm-martin', 'm-sofia'].includes(id)) ||
        m.rsvps.some(r => ['m-tomas', 'm-ana', 'm-carlos', 'm-lucia', 'm-martin', 'm-sofia'].includes(r.memberId))
      )
    );
    if (hasOldRiveraMeeting) {
      const defaultRiveraMeetings = INITIAL_MEETINGS.filter(m => m.familyId === 'rivera');
      const nonRiveraMeetings = parsed.filter(m => m.familyId !== 'rivera');
      const updated = [...defaultRiveraMeetings, ...nonRiveraMeetings];
      saveStoredMeetings(updated);
      return updated;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading meetings from localStorage', e);
    return INITIAL_MEETINGS;
  }
}

export function saveStoredMeetings(meetings: Meeting[]): void {
  try {
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
  } catch (e) {
    console.error('Error saving meetings to localStorage', e);
  }
}

export function resetDemoData(): void {
  localStorage.removeItem('salcie_families_v1');
  localStorage.removeItem('salcie_meetings_v1');
  localStorage.setItem(FAMILIES_KEY, JSON.stringify(INITIAL_FAMILIES));
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
}
