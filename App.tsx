
import React, { useState, useEffect } from 'react';
import Workspace from './views/Workspace';
import Symposium from './views/Symposium';
import ML from './views/ML';
import { UserIcon, UsersIcon, CubeTransparentIcon, WifiSlashIcon } from './components/icons/Icons';
import ErrorBoundary from './components/ErrorBoundary';

type View = 'workspace' | 'symposium' | 'ml';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('workspace');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const NavButton: React.FC<{
    viewName: View;
    label: string;
    icon: React.ReactNode;
  }> = ({ viewName, label, icon }) => (
    <button
      onClick={() => setActiveView(viewName)}
      className={`flex items-center gap-3 px-4 py-3 font-semibold rounded-t-lg transition-all border-b-2 ${
        activeView === viewName
          ? 'text-primary border-primary bg-surface'
          : 'text-text-secondary border-transparent hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full flex flex-col bg-base">
        {isOffline && (
          <div className="bg-yellow-600 text-white text-center p-2 text-sm font-semibold flex items-center justify-center gap-2">
            <WifiSlashIcon className="w-4 h-4" />
            You are currently offline. Functionality is limited.
          </div>
        )}
        <header className="px-6 flex items-center border-b border-overlay">
           <h1 className="text-2xl font-bold text-primary mr-8">AgentricAI</h1>
           <nav className="flex items-center gap-2">
              <NavButton viewName="workspace" label="Workspace" icon={<UserIcon />} />
              <NavButton viewName="ml" label="ML" icon={<CubeTransparentIcon className="w-5 h-5"/>} />
              <NavButton viewName="symposium" label="Symposium" icon={<UsersIcon />} />
           </nav>
           <div id="header-actions" className="ml-auto"></div>
        </header>
        <main className="flex-grow">
          {activeView === 'workspace' && <Workspace isOffline={isOffline} />}
          {activeView === 'ml' && <ML isOffline={isOffline} />}
          {activeView === 'symposium' && <Symposium isOffline={isOffline} />}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;