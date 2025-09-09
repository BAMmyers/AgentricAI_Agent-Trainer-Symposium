
import React, { useState, useRef, useEffect } from 'react';
import { ConversationMessage, SymposiumMode } from '../types';
import { PaperAirplaneIcon, CogIcon, SparklesIcon } from './icons/Icons';

interface ConversationLogProps {
  messages: ConversationMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isOffline: boolean;
  mode: SymposiumMode;
}

const ConversationBubble: React.FC<{ message: ConversationMessage }> = ({ message }) => {
  const isUser = message.senderType === 'user';
  const isSystem = message.senderType === 'system';
  const isModerator = message.senderType === 'moderator';

  if (isSystem) {
      return (
          <div className="text-center my-2 animate-fadeIn">
              <p className="text-xs text-text-secondary italic px-4 py-1 bg-overlay rounded-full inline-block">{message.text}</p>
          </div>
      )
  }

  if (isModerator) {
    return (
        <div className="flex items-center justify-center gap-3 my-3 animate-fadeIn py-2 border-y-2 border-dashed border-secondary/30">
            <SparklesIcon className="w-5 h-5 text-secondary flex-shrink-0" />
            <div className="flex-grow text-center">
                <p className="font-semibold text-secondary text-sm">Moderator</p>
                <p className="text-sm text-text-secondary italic">"{message.text}"</p>
            </div>
            <SparklesIcon className="w-5 h-5 text-secondary flex-shrink-0" />
        </div>
    )
  }
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isUser && <img src={message.avatar} alt={`${message.senderName} avatar`} className="w-8 h-8 rounded-full" />}
      <div className={`max-w-md p-3 rounded-xl ${isUser ? 'bg-primary text-white' : 'bg-overlay text-text-secondary'}`}>
        {!isUser && (
             <p className="text-xs font-bold text-highlight mb-1">{message.senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
       {isUser && <img src={message.avatar} alt="user avatar" className="w-8 h-8 rounded-full" />}
    </div>
  );
};


const ConversationLog: React.FC<ConversationLogProps> = ({ messages, onSendMessage, isLoading, isOffline, mode }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isOffline && mode !== 'assembly') {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const getPlaceholder = () => {
    if (isOffline) return "Offline: Cannot send messages";
    if (mode === 'assembly') return "Assembly Mode: Use controls to execute";
    return "Join the conversation...";
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {messages.length === 0 && (
            <div className="flex flex-col h-full items-center justify-center text-center text-text-secondary">
                <CogIcon className="w-16 h-16 mb-4 text-secondary animate-spin" style={{ animationDuration: '5s' }}/>
                <h3 className="text-lg font-semibold text-highlight">Agent Symposium</h3>
                <p>Load agents and configure the conversation controls to begin.</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <ConversationBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 animate-fadeIn py-4">
            <div className="flex items-center gap-2 p-2 rounded-full bg-overlay">
                <span className="w-2 h-2 bg-highlight rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-highlight rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-highlight rounded-full animate-pulse"></span>
            </div>
            <span className="text-sm text-text-secondary font-semibold">Simulation in progress...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t border-overlay pt-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full bg-overlay border border-transparent rounded-lg py-2 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
          disabled={isOffline || mode === 'assembly'}
        />
        <button type="submit" className="bg-primary p-2 rounded-full text-white hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-all" disabled={isOffline || mode === 'assembly'}>
          <PaperAirplaneIcon />
        </button>
      </form>
    </div>
  );
};

export default ConversationLog;