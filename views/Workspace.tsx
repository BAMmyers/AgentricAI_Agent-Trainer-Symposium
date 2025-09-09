

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useWorkspaceStore } from '../store/workspaceStore';
import ChatWindow from '../components/ChatWindow';
import WelcomeScreen from '../components/WelcomeScreen';
import AgentDevelopmentKit from '../components/AgentDevelopmentKit';
import TrainingTools from '../components/TrainingTools';
import NeuralPathwayToggle from '../components/NeuralPathwayToggle';


interface WorkspaceProps {
  isOffline: boolean;
}

const Workspace: React.FC<WorkspaceProps> = ({ isOffline }) => {
  // Get state and actions from the centralized Zustand store
  const { 
    agent, messages, activeMode, isLoading, isSpeaking, isAvatarAnimated, 
    isVoiceEnabled, isGenerating, generatedVideoUrl,
    generationError, generationProgress, neuralPathway,
    suggestedMemories, isAnalyzing, settings,
    ollamaStatus, ollamaUrl, ollamaError, ollamaModels, selectedOllamaModel,
    isPullingModel, pullingModelStatus
  } = useWorkspaceStore();
  
  const { 
    init, handleAgentLoad, handleAgentUpdate, handleModeChange, 
    handleSendMessage, setIsVoiceEnabled, setIsAvatarAnimated, 
    handleGenerateVideo, handleApplyVideoAsAvatar,
    importKnowledge,
    analyzeConversation, approveMemory, rejectMemory, clearSuggestions,
    setFineGrainedSetting,
    connectToOllama, setOllamaUrl, setSelectedOllamaModel,
    pullOllamaModel, deleteOllamaModel
  } = useWorkspaceStore();

  // Initialize the store with the current online/offline status
  useEffect(() => {
    init(isOffline);
  }, [isOffline, init]);
  
  // Render a welcome screen if no agent is loaded
  if (!agent) {
    return (
      <div className="min-h-full flex items-center justify-center p-4 bg-base">
        <WelcomeScreen onAgentLoad={handleAgentLoad} />
      </div>
    );
  }
  
  const portalRoot = document.getElementById('header-actions');

  return (
    <>
      {portalRoot && ReactDOM.createPortal(
        <NeuralPathwayToggle />,
        portalRoot
      )}
      <div className="h-full w-full p-4 lg:p-6 grid grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column: Agent Development Kit */}
        <div className="col-span-12 lg:col-span-3 h-[calc(100vh-80px)]">
            <AgentDevelopmentKit
                agent={agent}
                onAgentUpdate={handleAgentUpdate}
            />
        </div>

        {/* Center Column: Interaction */}
        <main className="col-span-12 lg:col-span-6 h-[calc(100vh-80px)] flex flex-col bg-surface rounded-xl shadow-lg border border-overlay">
          <ChatWindow 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            agent={agent} 
            isOffline={isOffline}
            neuralPathway={neuralPathway}
          />
        </main>
        
        {/* Right Column: Training Tools */}
         <div className="col-span-12 lg:col-span-3 h-[calc(100vh-80px)]">
            <TrainingTools
                agent={agent}
                isGenerating={isGenerating}
                generatedVideoUrl={generatedVideoUrl}
                generationError={generationError}
                generationProgress={generationProgress}
                handleGenerateVideo={handleGenerateVideo}
                handleApplyVideoAsAvatar={handleApplyVideoAsAvatar}
                handleAgentUpdate={handleAgentUpdate}
                isVoiceEnabled={isVoiceEnabled}
                isAvatarAnimated={isAvatarAnimated}
                setIsVoiceEnabled={setIsVoiceEnabled}
                setIsAvatarAnimated={setIsAvatarAnimated}
                handleAgentLoad={handleAgentLoad}
                importKnowledge={importKnowledge}
                messages={messages}
                neuralPathway={neuralPathway}
                isAnalyzing={isAnalyzing}
                suggestedMemories={suggestedMemories}
                analyzeConversation={analyzeConversation}
                approveMemory={approveMemory}
                rejectMemory={rejectMemory}
                clearSuggestions={clearSuggestions}
                settings={settings}
                setFineGrainedSetting={setFineGrainedSetting}
                ollamaStatus={ollamaStatus}
                ollamaUrl={ollamaUrl}
                ollamaError={ollamaError}
                ollamaModels={ollamaModels}
                selectedOllamaModel={selectedOllamaModel}
                connectToOllama={connectToOllama}
                setOllamaUrl={setOllamaUrl}
                setSelectedOllamaModel={setSelectedOllamaModel}
                isPullingModel={isPullingModel}
                pullingModelStatus={pullingModelStatus}
                pullOllamaModel={pullOllamaModel}
                deleteOllamaModel={deleteOllamaModel}
            />
         </div>
      </div>
    </>
  );
};

export default Workspace;
