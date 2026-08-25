import { Family, FamilyMember, Meeting, MeetingStatus, MeetingTask, Memory, RSVPStatus } from '../types';
import { INITIAL_FAMILIES, INITIAL_MEETINGS } from './mockData';

const FAMILIES_KEY = 'salcie_families_v1';
const MEETINGS_KEY = 'salcie_meetings_v1';

export function getStoredFamilies(): Family[] {
  try {
    const raw = localStorage.getItem(FAMILIES_KEY);
    if (!raw) {
      localStorage.setItem(FAMILIES_KEY, JSON.stringify(INITIAL_FAMILIES));
      return INITIAL_FAMILIES;
    }
    return JSON.parse(raw);
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
      localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
      return INITIAL_MEETINGS;
    }
    return JSON.parse(raw);
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
  localStorage.setItem(FAMILIES_KEY, JSON.stringify(INITIAL_FAMILIES));
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
}
