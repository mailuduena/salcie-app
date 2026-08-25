import React, { useState, useEffect } from 'react';
import { ActiveScreen, Family, Meeting } from './types';
import { 
  getStoredFamilies, 
  saveStoredFamilies, 
  getStoredMeetings, 
  saveStoredMeetings, 
  resetDemoData 
} from './data/storage';
import { ToastProvider, useToast } from './components/ToastContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { NewFamilyModal } from './components/NewFamilyModal';
import { ConfirmModal } from './components/ConfirmModal';

// Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { FamiliesScreen } from './screens/FamiliesScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MeetingsScreen } from './screens/MeetingsScreen';
import { MeetingDetailScreen } from './screens/MeetingDetailScreen';
import { CreateMeetingScreen } from './screens/CreateMeetingScreen';
import { MemoriesScreen } from './screens/MemoriesScreen';
import { FamilyMembersScreen } from './screens/FamilyMembersScreen';

function MainApp() {
  const { showToast } = useToast();

  // Primary state
  const [families, setFamilies] = useState<Family[]>(() => getStoredFamilies());
  const [meetings, setMeetings] = useState<Meeting[]>(() => getStoredMeetings());
  const [activeFamilyId, setActiveFamilyId] = useState<string>(() => {
    const fams = getStoredFamilies();
    return fams[0]?.id || 'rivera';
  });
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('welcome');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  // Modals state
  const [isNewFamilyModalOpen, setIsNewFamilyModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Save to localStorage on state changes
  useEffect(() => {
    saveStoredFamilies(families);
  }, [families]);

  useEffect(() => {
    saveStoredMeetings(meetings);
  }, [meetings]);

  // Active family object
  const activeFamily = families.find((f) => f.id === activeFamilyId) || families[0];

  // Active meeting object for detail screen
  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);

  // --- Handlers ---
  const handleSelectFamily = (familyId: string) => {
    setActiveFamilyId(familyId);
    setCurrentScreen('home');
    const fam = families.find((f) => f.id === familyId);
    showToast(`Cambiado al espacio familiar: ${fam?.name || ''}`);
  };

  const handleCreateFamily = (name: string, coverUrl: string, creatorName: string) => {
    const newId = `fam-${Date.now()}`;
    const newFamily: Family = {
      id: newId,
      name,
      coverUrl,
      creatorName,
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        {
          id: `m-${newId}-creator`,
          name: creatorName,
          relation: 'Tú',
          role: 'admin',
          inviteStatus: 'accepted',
          isCurrentUser: true,
          avatarColor: '#FF2EB5',
        },
      ],
    };

    const updated = [...families, newFamily];
    setFamilies(updated);
    setActiveFamilyId(newId);
    setCurrentScreen('home');
    showToast(`¡Espacio "${name}" creado exitosamente!`);
  };

  const handleUpdateFamily = (updatedFamily: Family) => {
    const updated = families.map((f) => (f.id === updatedFamily.id ? updatedFamily : f));
    setFamilies(updated);
  };

  const handleSwitchMember = (memberId: string) => {
    if (!activeFamily) return;
    const updatedFamily: Family = {
      ...activeFamily,
      members: activeFamily.members.map((m) => ({
        ...m,
        isCurrentUser: m.id === memberId,
      })),
    };
    handleUpdateFamily(updatedFamily);
    const switched = activeFamily.members.find((m) => m.id === memberId);
    showToast(`🎭 Probando la demo como: ${switched?.name || 'integrante'}`);
  };

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setCurrentScreen('meeting_detail');
  };

  const handleCreateMeeting = (newMeeting: Meeting) => {
    const updated = [newMeeting, ...meetings];
    setMeetings(updated);
    setSelectedMeetingId(newMeeting.id);
    setCurrentScreen('meeting_detail');
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    const updated = meetings.map((m) => (m.id === updatedMeeting.id ? updatedMeeting : m));
    setMeetings(updated);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    const updated = meetings.filter((m) => m.id !== meetingId);
    setMeetings(updated);
    setSelectedMeetingId(null);
    setCurrentScreen('meetings');
    showToast('Encuentro eliminado.');
  };

  const handleDeleteFamily = (familyId: string) => {
    if (families.length <= 1) {
      showToast('No se puede eliminar la única familia disponible.');
      return;
    }

    const updatedFamilies = families.filter((f) => f.id !== familyId);
    const updatedMeetings = meetings.filter((m) => m.familyId !== familyId);

    setFamilies(updatedFamilies);
    setMeetings(updatedMeetings);
    saveStoredFamilies(updatedFamilies);
    saveStoredMeetings(updatedMeetings);

    // If deleted family was active, switch to another available family
    if (activeFamilyId === familyId) {
      const nextFamily = updatedFamilies[0];
      if (nextFamily) {
        setActiveFamilyId(nextFamily.id);
        // Ensure the new active family has an active profile
        const hasCurrentUser = nextFamily.members.some((m) => m.isCurrentUser);
        if (!hasCurrentUser && nextFamily.members.length > 0) {
          const fixedNextFamily: Family = {
            ...nextFamily,
            members: nextFamily.members.map((m, idx) => ({
              ...m,
              isCurrentUser: idx === 0,
            })),
          };
          const finalFamilies = updatedFamilies.map((f) =>
            f.id === fixedNextFamily.id ? fixedNextFamily : f
          );
          setFamilies(finalFamilies);
          saveStoredFamilies(finalFamilies);
        }
      }
    }

    showToast('Familia eliminada correctamente');
  };

  const handleResetDemoData = () => {
    resetDemoData();
    const freshFamilies = getStoredFamilies();
    const freshMeetings = getStoredMeetings();
    setFamilies(freshFamilies);
    setMeetings(freshMeetings);
    setActiveFamilyId(freshFamilies[0]?.id || 'rivera');
    setSelectedMeetingId(null);
    setCurrentScreen('home');
    showToast('Datos de la demo reiniciados a los valores iniciales.');
  };

  // Determine if top navbar & bottom navigation should be displayed
  const showNavbars = currentScreen !== 'welcome' && currentScreen !== 'login';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FF] text-[#15172A]">
      
      {/* Top Navbar */}
      {showNavbars && (
        <Navbar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          families={families}
          activeFamilyId={activeFamilyId}
          onSelectFamily={handleSelectFamily}
          onOpenNewFamilyModal={() => setIsNewFamilyModalOpen(true)}
          onResetDemo={() => setIsResetConfirmOpen(true)}
          onSwitchMember={handleSwitchMember}
        />
      )}

      {/* Main Content View */}
      <main className={`flex-1 ${showNavbars ? 'pb-24 md:pb-12' : ''}`}>
        
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            onEnter={() => setCurrentScreen('login')}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onEnterDemo={() => setCurrentScreen('families')}
            onBack={() => setCurrentScreen('welcome')}
          />
        )}

        {currentScreen === 'families' && (
          <FamiliesScreen
            families={families}
            meetings={meetings}
            onSelectFamily={handleSelectFamily}
            onOpenNewFamilyModal={() => setIsNewFamilyModalOpen(true)}
            onDeleteFamily={handleDeleteFamily}
          />
        )}

        {currentScreen === 'home' && activeFamily && (
          <HomeScreen
            activeFamily={activeFamily}
            meetings={meetings}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onSelectMeeting={handleSelectMeeting}
            onOpenFamiliesScreen={() => setCurrentScreen('families')}
            onSwitchMember={handleSwitchMember}
          />
        )}

        {currentScreen === 'meetings' && activeFamily && (
          <MeetingsScreen
            activeFamily={activeFamily}
            meetings={meetings}
            onSelectMeeting={handleSelectMeeting}
            onCreateMeeting={() => setCurrentScreen('create_meeting')}
          />
        )}

        {currentScreen === 'meeting_detail' && selectedMeeting && activeFamily && (
          <MeetingDetailScreen
            meeting={selectedMeeting}
            activeFamily={activeFamily}
            onBack={() => setCurrentScreen('meetings')}
            onUpdateMeeting={handleUpdateMeeting}
            onDeleteMeeting={handleDeleteMeeting}
            onSwitchMember={handleSwitchMember}
          />
        )}

        {currentScreen === 'create_meeting' && activeFamily && (
          <CreateMeetingScreen
            activeFamily={activeFamily}
            onCancel={() => setCurrentScreen('home')}
            onCreate={handleCreateMeeting}
          />
        )}

        {currentScreen === 'memories' && activeFamily && (
          <MemoriesScreen
            activeFamily={activeFamily}
            meetings={meetings}
            onUpdateMeeting={handleUpdateMeeting}
          />
        )}

        {currentScreen === 'family_members' && activeFamily && (
          <FamilyMembersScreen
            activeFamily={activeFamily}
            onUpdateFamily={handleUpdateFamily}
            onSwitchMember={handleSwitchMember}
          />
        )}

      </main>

      {/* Fixed Mobile Bottom Navigation */}
      {showNavbars && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => {
            if (screen === 'meeting_detail') {
              setCurrentScreen('meetings');
            } else {
              setCurrentScreen(screen);
            }
          }}
        />
      )}

      {/* Global New Family Modal */}
      <NewFamilyModal
        isOpen={isNewFamilyModalOpen}
        onClose={() => setIsNewFamilyModalOpen(false)}
        onCreate={handleCreateFamily}
      />

      {/* Reset Demo Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="¿Reiniciar datos de la demo?"
        message="Se restablecerán las dos familias ficticias iniciales (Familia Rivera y Familia Pérez) y todos los encuentros originales."
        confirmLabel="Reiniciar demo"
        isDestructive={true}
        onConfirm={handleResetDemoData}
        onClose={() => setIsResetConfirmOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
