import React, { useState, useEffect } from 'react';
import { PersonaConfig } from '../types';
import { SparklesIcon, PencilIcon, CheckIcon, XMarkIcon } from './icons/Icons';
import { generatePersona } from '../services/geminiService';

interface PersonaStudioProps {
  persona: string;
  onSave: (newPersona: string) => void;
}

type StudioMode = 'view' | 'edit' | 'generate';

const PersonaStudio: React.FC<PersonaStudioProps> = ({ persona, onSave }) => {
  const [mode, setMode] = useState<StudioMode>('view');
  const [editedPersona, setEditedPersona] = useState(persona);
  const [generatorConfig, setGeneratorConfig] = useState<PersonaConfig>({ coreTraits: '', primaryRole: '', communicationStyle: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedPersona(persona);
    if (mode === 'edit') {
        setMode('view'); // Exit edit mode if underlying persona changes
    }
  }, [persona]);

  const handleBlur = () => {
    const trimmedValue = editedPersona.trim();
    if (trimmedValue && trimmedValue !== persona) {
      onSave(trimmedValue);
    } else {
      setEditedPersona(persona); // Revert if empty or unchanged
    }
    setMode('view');
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        const newPersona = await generatePersona(generatorConfig);
        setEditedPersona(newPersona);
        setMode('edit'); // Switch to edit mode to allow refinement
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsGenerating(false);
    }
  };

  const isGeneratorFormValid = Object.values(generatorConfig).every(v => v.trim().length > 0);

  if (mode === 'view') {
    return (
      <div className="group flex justify-between items-start">
        <p className="text-text-secondary text-sm" onClick={() => setMode('edit')}>{persona || 'No persona defined.'}</p>
        <div className="flex-shrink-0 pl-2">
            <button onClick={() => setMode('edit')} className="text-text-secondary hover:text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><PencilIcon className="w-4 h-4" /></button>
            <button onClick={() => setMode('generate')} className="text-text-secondary hover:text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><SparklesIcon className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-2 animate-fadeIn">
        <textarea
          value={editedPersona}
          onChange={(e) => setEditedPersona(e.target.value)}
          onBlur={handleBlur}
          className="w-full bg-overlay border border-secondary rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          rows={6}
          autoFocus
        />
      </div>
    );
  }

  if (mode === 'generate') {
    return (
        <div className="space-y-3 animate-fadeIn p-3 bg-overlay/50 rounded-lg">
            <p className="text-sm text-highlight font-semibold">AI-Assisted Persona Creator</p>
            <input type="text" placeholder="Core Traits (e.g., curious, witty, cautious)" value={generatorConfig.coreTraits} onChange={e => setGeneratorConfig({...generatorConfig, coreTraits: e.target.value})} className="w-full bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"/>
            <input type="text" placeholder="Primary Role (e.g., starship navigator, historian)" value={generatorConfig.primaryRole} onChange={e => setGeneratorConfig({...generatorConfig, primaryRole: e.target.value})} className="w-full bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"/>
            <input type="text" placeholder="Communication Style (e.g., concise, poetic)" value={generatorConfig.communicationStyle} onChange={e => setGeneratorConfig({...generatorConfig, communicationStyle: e.target.value})} className="w-full bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"/>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-overlay/50">
                 <button onClick={() => setMode('view')} className="text-sm text-text-secondary hover:text-white">Cancel</button>
                 <button onClick={handleGenerate} disabled={!isGeneratorFormValid || isGenerating} className="flex items-center gap-2 text-sm bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50">
                    <SparklesIcon className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Generate Persona'}
                 </button>
            </div>
        </div>
    )
  }

  return null;
};

export default PersonaStudio;
