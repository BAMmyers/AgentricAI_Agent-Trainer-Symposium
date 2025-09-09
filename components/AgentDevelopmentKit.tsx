

import React, { useState, useEffect } from 'react';
import { Agent, Mode } from '../types';
import { ChipIcon, InformationCircleIcon, UserCircleIcon, PencilIcon, LightBulbIcon, PlusIcon, ChevronDownIcon, IdentificationIcon, XMarkIcon, CheckIcon, TrashIcon } from './icons/Icons';
import { useEditableField } from '../hooks/useEditableField';
import PersonaStudio from './PersonaStudio';

interface AgentDevelopmentKitProps {
  agent: Agent;
  onAgentUpdate: (updatedAgent: Agent) => void;
}

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; headerActions?: React.ReactNode }> = ({ title, icon, children, defaultOpen = false, headerActions }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-overlay py-4">
            <div className="w-full flex justify-between items-center text-left font-semibold text-highlight">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 flex-grow hover:text-white transition-colors">
                    {icon} {title}
                </button>
                <div className="flex items-center gap-2">
                    {headerActions}
                    <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:text-white transition-colors">
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isOpen && <div className="mt-4 pl-1 space-y-3 animate-fadeIn">{children}</div>}
        </div>
    );
};

const EditableField: React.FC<{
    label: string,
    editor: ReturnType<typeof useEditableField>, 
    isTextArea?: boolean
}> = ({ label, editor, isTextArea = false }) => (
    <>
      {editor.isEditing ? (
        <div className="flex flex-col gap-2 animate-fadeIn">
          {isTextArea ? (
            <textarea
                value={editor.value}
                onChange={(e) => editor.setValue(e.target.value)}
                onBlur={editor.handleBlur}
                onKeyDown={editor.handleKeyDown}
                className="w-full bg-overlay border border-secondary rounded-lg p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                rows={4}
                autoFocus
            />
          ) : (
            <input
                type="text"
                value={editor.value}
                onChange={(e) => editor.setValue(e.target.value)}
                onBlur={editor.handleBlur}
                onKeyDown={editor.handleKeyDown}
                className="w-full bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                autoFocus
            />
          )}
        </div>
      ) : (
        <div className="group flex justify-between items-start">
            <p className="text-text-secondary text-sm" onClick={() => editor.setIsEditing(true)}>{editor.value || `No ${label.toLowerCase()} available.`}</p>
            <button onClick={() => editor.setIsEditing(true)} className="text-text-secondary hover:text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <PencilIcon className="w-4 h-4" />
            </button>
        </div>
      )}
    </>
);

const AgentDevelopmentKit: React.FC<AgentDevelopmentKitProps> = ({ agent, onAgentUpdate }) => {
  const nameEditor = useEditableField(agent.name, (newName) => onAgentUpdate({ ...agent, name: newName }));
  const roleEditor = useEditableField(agent.role, (newRole) => onAgentUpdate({ ...agent, role: newRole }));
  const descEditor = useEditableField(agent.description, (newDesc) => onAgentUpdate({ ...agent, description: newDesc }));
  
  const [newCap, setNewCap] = useState('');
  const [newKnowledge, setNewKnowledge] = useState('');
  const [editingKnowledgeIndex, setEditingKnowledgeIndex] = useState<number | null>(null);
  const [editingKnowledgeText, setEditingKnowledgeText] = useState('');
  const [originalEditingText, setOriginalEditingText] = useState('');


  useEffect(() => {
    nameEditor.reset(agent.name);
    roleEditor.reset(agent.role);
    descEditor.reset(agent.description);
  }, [agent]);

  const handleUpdateKnowledge = (index: number, newText: string) => {
    const updatedKnowledge = [...(agent.knowledgeBase || [])];
    updatedKnowledge[index] = newText.trim();
    onAgentUpdate({ ...agent, knowledgeBase: updatedKnowledge.filter(Boolean) });
    setEditingKnowledgeIndex(null);
  };

  const handleAddKnowledge = () => {
    if (newKnowledge.trim()) {
        const updatedKnowledge = [...(agent.knowledgeBase || []), newKnowledge.trim()];
        onAgentUpdate({ ...agent, knowledgeBase: updatedKnowledge });
        setNewKnowledge('');
    }
  };

  const handleRemoveKnowledge = (index: number) => {
    const updatedKnowledge = (agent.knowledgeBase || []).filter((_, i) => i !== index);
    onAgentUpdate({ ...agent, knowledgeBase: updatedKnowledge });
  };
  
    const handleClearKnowledge = () => {
        if (window.confirm('Are you sure you want to delete all learned knowledge? This cannot be undone.')) {
            onAgentUpdate({ ...agent, knowledgeBase: [] });
        }
    };

  const handleAddCap = () => {
    const newCapTrimmed = newCap.trim().toLowerCase() as Mode;
    const currentCaps = agent.capabilities || [];
    if (newCapTrimmed && !currentCaps.includes(newCapTrimmed)) {
      onAgentUpdate({ ...agent, capabilities: [...currentCaps, newCapTrimmed] });
      setNewCap('');
    }
  };

  const handleRemoveCap = (capToRemove: Mode) => {
    const currentCaps = agent.capabilities || [];
    onAgentUpdate({ ...agent, capabilities: currentCaps.filter(cap => cap !== capToRemove) });
  };

  return (
    <div className="bg-surface p-4 rounded-xl shadow-lg border border-overlay animate-fadeIn flex flex-col h-full">
      <div className="p-2">
        <h2 className="text-xl font-bold text-text-primary">Agent Development Kit</h2>
        <p className="text-sm text-text-secondary">Define the agent's core brain.</p>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 mt-2">
        <CollapsibleSection title="Identity" icon={<UserCircleIcon />} defaultOpen>
            <div>
                <label className="text-xs font-semibold text-highlight">Name</label>
                <EditableField label="Name" editor={nameEditor} />
            </div>
             <div>
                <label className="text-xs font-semibold text-highlight">Role</label>
                <EditableField label="Role" editor={roleEditor} />
            </div>
             <div>
                <label className="text-xs font-semibold text-highlight">Description</label>
                <EditableField label="Description" editor={descEditor} isTextArea/>
            </div>
        </CollapsibleSection>
        
        <CollapsibleSection title="Persona" icon={<IdentificationIcon />} defaultOpen>
            <PersonaStudio persona={agent.persona} onSave={(p) => onAgentUpdate({...agent, persona: p})} />
        </CollapsibleSection>

        <CollapsibleSection title="Capabilities" icon={<ChipIcon />}>
            <div className="flex flex-wrap gap-2">
            {(agent.capabilities || []).map(cap => (
                <span key={cap} className="flex items-center gap-2 px-3 py-1 bg-secondary text-white text-xs font-medium rounded-full animate-fadeIn">
                <span className="capitalize">{cap}</span>
                <button onClick={() => handleRemoveCap(cap)} className="text-highlight hover:text-white"><XMarkIcon className="w-3 h-3"/></button>
                </span>
            ))}
            </div>
            <div className="flex gap-2 mt-3">
            <input
                type="text" value={newCap} onChange={(e) => setNewCap(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCap()}
                placeholder="Add new capability" className="flex-grow bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
            />
            <button onClick={handleAddCap} className="p-2 rounded-full text-white bg-secondary hover:bg-opacity-80"><PlusIcon className="w-4 h-4"/></button>
            </div>
        </CollapsibleSection>

        <CollapsibleSection 
            title="Knowledge Base" 
            icon={<LightBulbIcon />}
            headerActions={
                agent.knowledgeBase && agent.knowledgeBase.length > 0 ? (
                    <button onClick={handleClearKnowledge} className="p-1 rounded-full text-red-400 hover:text-red-300 transition-colors" title="Clear all knowledge">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                ) : null
            }
            defaultOpen>
             {(!agent.knowledgeBase || agent.knowledgeBase.length === 0) ? (
                <p className="text-text-secondary text-sm italic">No memories stored. Teach the agent or add knowledge here.</p>
            ) : (
                <div className="space-y-2">
                    {agent.knowledgeBase.map((concept, index) => (
                        <div key={index} className="group bg-overlay/50 p-2 rounded-lg text-sm text-text-primary animate-fadeIn flex justify-between items-start gap-2">
                            {editingKnowledgeIndex === index ? (
                                 <div className="flex-grow flex flex-col gap-2">
                                    <textarea
                                        value={editingKnowledgeText}
                                        onChange={(e) => setEditingKnowledgeText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingKnowledgeIndex(null); }}
                                        className="w-full bg-overlay border border-primary rounded p-1 text-sm"
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                         <button onClick={() => setEditingKnowledgeText(originalEditingText)} className="text-xs text-text-secondary hover:text-white" title="Revert to original">
                                            Revert
                                        </button>
                                        <button onClick={() => setEditingKnowledgeIndex(null)} className="p-1.5 rounded-full text-text-secondary hover:bg-overlay" title="Cancel">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleUpdateKnowledge(index, editingKnowledgeText)} className="p-1.5 rounded-full text-green-400 hover:bg-overlay" title="Save">
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="flex-grow break-words">{concept}</p>
                                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingKnowledgeIndex(index); setEditingKnowledgeText(concept); setOriginalEditingText(concept); }} className="p-1 text-highlight hover:text-white" title="Edit">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleRemoveKnowledge(index)} className="p-1 text-red-400 hover:text-red-300" title="Delete">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
             <div className="flex gap-2 mt-3 pt-3 border-t border-overlay/50">
                <input
                    type="text" value={newKnowledge} onChange={(e) => setNewKnowledge(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddKnowledge()}
                    placeholder="Add new knowledge" className="flex-grow bg-overlay border border-secondary rounded-lg py-1 px-2 text-sm"
                />
                <button onClick={handleAddKnowledge} className="p-2 rounded-full text-white bg-secondary hover:bg-opacity-80"><PlusIcon className="w-4 h-4"/></button>
            </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default AgentDevelopmentKit;
