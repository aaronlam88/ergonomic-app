// src/App.tsx
import { useState } from 'react';
import { Sliders, Plus, Trash2, User, History, Shield } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { MeasurementForm } from './components/MeasurementForm';
import { DimensionResult } from './components/DimensionResult';
import { CompareSpecs } from './components/CompareSpecs';
import type { UserMeasurements } from './logic/calcEngine';

interface SavedProfile {
  id: string;
  name: string;
  measurements: UserMeasurements;
  isInch: boolean;
  date: string;
}

function App() {
  const [profiles, setProfiles] = useLocalStorage<SavedProfile[]>('ergo-profiles', []);
  const [activeProfileId, setActiveProfileId] = useLocalStorage<string | null>('ergo-active-id', null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [currentTab, setCurrentTab] = useState<'dimensions' | 'compare'>('dimensions');
  const [profileNameInput, setProfileNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Active profile object
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const handleCreateProfile = (measurements: UserMeasurements, isInch: boolean) => {
    const defaultName = `Profile ${profiles.length + 1}`;
    const newProfile: SavedProfile = {
      id: Date.now().toString(),
      name: defaultName,
      measurements,
      isInch,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
    setIsCreatingNew(false);
    setProfileNameInput(defaultName);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    
    if (activeProfileId === id) {
      if (updated.length > 0) {
        setActiveProfileId(updated[0].id);
      } else {
        setActiveProfileId(null);
      }
    }
  };

  const handleUpdateProfileName = () => {
    if (!profileNameInput.trim() || !activeProfileId) return;
    setProfiles(profiles.map(p => 
      p.id === activeProfileId ? { ...p, name: profileNameInput.trim() } : p
    ));
    setIsEditingName(false);
  };

  const startNewSetup = () => {
    setIsCreatingNew(true);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      
      {/* Navigation Header */}
      <header className="no-print border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sliders className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight text-slate-100 flex items-center gap-1.5">
              Antigravity Ergo
              <span className="text-[10px] font-bold text-violet-400 border border-violet-800/40 bg-violet-950/25 px-1.5 py-0.5 rounded">
                CALCULATOR
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeProfile && !isCreatingNew && (
              <button
                type="button"
                onClick={startNewSetup}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Profile
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8">
        
        {/* If no profiles exist and we're not inside the form, prompt onboarding */}
        {profiles.length === 0 && !isCreatingNew ? (
          <div className="max-w-xl mx-auto text-center mt-12 py-10 px-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/20 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
              <Sliders className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-3">
              Calculate Your Ideal Workstation
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
              A scientific workstation setup prevents chronic fatigue, wrist pain, and lower back strain. Let's calibrate your measurements in minutes.
            </p>
            <button
              type="button"
              onClick={startNewSetup}
              className="py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 glow-btn"
            >
              Get Started
            </button>
          </div>
        ) : isCreatingNew ? (
          // Measuring wizard flow
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="no-print">
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Anthropometric Measurement Wizard
                <span className="text-xs font-normal text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">
                  New Setup
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Follow the anatomical prompts below and enter measurements to calibrate the dimension engine.
              </p>
            </div>
            
            <MeasurementForm
              onComplete={handleCreateProfile}
              initialUnitIsInch={activeProfile?.isInch}
              initialData={activeProfile?.measurements}
            />

            {profiles.length > 0 && (
              <div className="text-center no-print">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-350 underline transition-colors"
                >
                  Cancel setup & return to dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          // Dashboard Workspace
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sidebar Controls (No-print) */}
            <div className="space-y-6 lg:col-span-1 no-print">
              
              {/* Profiles List */}
              <div className="bg-slate-900/40 border border-slate-850/60 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5" />
                  Saved Profiles
                </h3>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {profiles.map((p) => {
                    const isActive = p.id === activeProfileId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProfileId(p.id);
                          setProfileNameInput(p.name);
                        }}
                        className={`w-full p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between group
                          ${isActive 
                            ? 'bg-violet-500/10 border-violet-500/40 text-slate-200' 
                            : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300'
                          }`}
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold text-xs block truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">{p.date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProfile(p.id, e)}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-900 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          title="Delete profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={startNewSetup}
                  className="w-full flex items-center justify-center gap-1 py-2 bg-slate-950/60 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold transition-all active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Profile
                </button>
              </div>

              {/* Profile Config Settings */}
              {activeProfile && (
                <div className="bg-slate-900/40 border border-slate-850/60 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Profile Details
                  </h3>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Label / Name
                    </label>
                    {isEditingName ? (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={profileNameInput}
                          onChange={(e) => setProfileNameInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-slate-200 text-xs focus:border-violet-500 focus:bg-slate-950 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleUpdateProfileName}
                          className="bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white rounded-lg hover:bg-violet-500"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">{activeProfile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileNameInput(activeProfile.name);
                            setIsEditingName(true);
                          }}
                          className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 underline"
                        >
                          Rename
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Gender Ref:</span>
                    <span className="font-semibold text-slate-350 capitalize">{activeProfile.measurements.gender}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className="w-full py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-lg text-[11px] font-semibold transition-all text-center"
                  >
                    Adjust Measurements
                  </button>
                </div>
              )}

              {/* Informative Guidance Card */}
              <div className="border border-slate-900 bg-slate-950/10 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Posture Baseline
                </h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Calculated values assume a standard neutral posture. Always maintain 90° bends at hips, knees, and elbows, and ensure screen centers lie level with resting eye heights.
                </p>
              </div>

            </div>

            {/* Dashboard Content (Tabs + Result display) */}
            {activeProfile && (
              <div className="lg:col-span-3 space-y-6">
                
                {/* Tabs Selector (No-print) */}
                <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-900/60 no-print">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('dimensions')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                      ${currentTab === 'dimensions'
                        ? 'bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white shadow-md shadow-violet-500/5'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Ideal Workstation Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('compare')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                      ${currentTab === 'compare'
                        ? 'bg-gradient-to-br from-violet-600/80 to-indigo-600/80 text-white shadow-md shadow-violet-500/5'
                        : 'text-slate-400 hover:text-slate-200'
                      }`}
                  >
                    Chair Model Compatibility Audit
                  </button>
                </div>

                {/* Tab content renders here */}
                <div>
                  {currentTab === 'dimensions' ? (
                    <DimensionResult
                      measurements={activeProfile.measurements}
                      isInch={activeProfile.isInch}
                      onReset={() => setIsCreatingNew(true)}
                    />
                  ) : (
                    <CompareSpecs
                      userMeasurements={activeProfile.measurements}
                      isInch={activeProfile.isInch}
                    />
                  )}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950/30 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-[10px] text-slate-500 leading-normal space-y-1.5">
          <p>© {new Date().getFullYear()} Antigravity Systems. Designed in pair programming with AI developers.</p>
          <p>This calculator provides recommendation values. Always adjust individual fittings based on orthopedic symptoms and physical configurations.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
