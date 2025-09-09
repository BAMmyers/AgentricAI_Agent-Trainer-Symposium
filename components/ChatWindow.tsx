
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Agent } from '../types';
import { PaperAirplaneIcon, LightningBoltIcon, LightBulbIcon, ClipboardIcon, CheckIcon, ShieldExclamationIcon, BrainIcon, BrainCircuitIcon } from './icons/Icons';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  agent: Agent;
  isOffline: boolean;
  neuralPathway: 'API' | 'Native';
}

const ChatBubble: React.FC<{ message: ChatMessage; agent: Agent }> = ({ message, agent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderSystemMessage = (icon: React.ReactNode, text: string) => (
     <div className="flex items-center justify-center gap-2 my-2 animate-fadeIn">
        {icon}
        <p className="text-xs text-text-secondary italic">{text}</p>
      </div>
  );

  const renderErrorMessage = () => (
    <div className="flex items-start justify-center gap-3 my-2 animate-fadeIn p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
      <ShieldExclamationIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
      <div className="flex-grow">
          <p className="font-semibold text-red-400 text-sm">A Problem Occurred</p>
          <p className="text-xs text-text-secondary whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );

  switch(message.type) {
    case 'system':
      return renderSystemMessage(<LightBulbIcon className="w-4 h-4 text-highlight" />, message.text);
    case 'cognition':
      return renderSystemMessage(<BrainCircuitIcon className="w-4 h-4 text-secondary" />, message.text);
    case 'error':
      return renderErrorMessage();
  }


  const isAgent = message.sender === 'agent';
  const isNative = isAgent && (message.type === 'local' || message.type === 'native_inference');
  
  const avatarUrl = isAgent 
    ? (agent.metadata?.avatar?.static || `https://i.pravatar.cc/150?u=${agent.name}`) 
    : 'https://i.pravatar.cc/150?u=user';
  
  const renderHeader = () => {
    switch (message.type) {
        case 'local':
            return (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-highlight font-semibold">
                    <LightningBoltIcon className="w-4 h-4" />
                    <span>Native Logic Response</span>
                </div>
            );
        case 'native_inference':
            return (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-secondary font-semibold">
                    <BrainIcon className="w-4 h-4" />
                    <span>Response from Memory</span>
                </div>
            );
        default:
            return null;
    }
  }

  const bubbleClasses = isAgent
    ? isNative
      ? 'bg-gradient-to-br from-secondary/20 to-overlay border border-secondary/40 text-text-secondary'
      : 'bg-overlay text-text-secondary'
    : 'bg-primary text-white';
  
  return (
    <div className={`group flex items-start gap-3 ${isAgent ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      {isAgent && <img src={avatarUrl} alt="agent avatar" className="w-8 h-8 rounded-full" />}
      
      <div className="relative">
        <div className={`max-w-md p-3 rounded-xl ${bubbleClasses}`}>
          {renderHeader()}
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
        
        {isAgent && message.isProcessing && (
            <div className="absolute -bottom-2 -left-2 p-1.5 bg-surface border border-overlay rounded-full text-text-secondary" title="Agent is processing...">
                <BrainCircuitIcon className="w-4 h-4 text-secondary animate-pulse" />
            </div>
        )}

        {isAgent && !message.isProcessing && (
          <button onClick={handleCopy} className="absolute -bottom-2 -right-2 p-1.5 bg-surface border border-overlay rounded-full text-text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
          </button>
        )}
      </div>

       {!isAgent && <img src={avatarUrl} alt="user avatar" className="w-8 h-8 rounded-full" />}
    </div>
  );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, agent, isOffline, neuralPathway }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const agentAvatar = agent.metadata?.avatar?.static || `https://i.pravatar.cc/150?u=${agent.name}`;
  const placeholderText = isOffline
    ? "Offline: Native Pathway only..."
    : `Message Agent (${neuralPathway} Pathway)...`;

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex-grow overflow-y-auto pr-2 space-y-6">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} agent={agent}/>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start animate-fadeIn">
            <img src={agentAvatar} alt="agent avatar" className="w-8 h-8 rounded-full" />
            <div className="max-w-md p-3 rounded-xl bg-overlay text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-highlight rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-highlight rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-highlight rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-overlay pt-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholderText}
          className="w-full bg-overlay border border-transparent rounded-lg py-2 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} className="bg-primary p-2 rounded-full text-white hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all">
          <PaperAirplaneIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;