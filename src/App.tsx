import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchBar } from './components/SearchBar';
import { LogViewer } from './components/LogViewer';
import { NetworkVisualization } from './components/NetworkVisualization';
import { PathInfo } from './components/PathInfo';
import { useWebSocket } from './hooks/useWebSocket';
import type { Person, SearchParams } from './types';
import { Network } from 'lucide-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    },
  },
});

function AppContent() {
  const [startPerson, setStartPerson] = useState<Person | null>(null);
  const [endPerson, setEndPerson] = useState<Person | null>(null);
  
  const {
    messages,
    isConnected,
    isSearching,
    exploredNodes,
    activePath,
    linkInfo,
    connectAndSearch,
    disconnect
  } = useWebSocket();

  const handleSearch = () => {
    if (!startPerson || !endPerson) return;

    const searchParams: SearchParams = {
      from: startPerson.name,
      to: endPerson.name
    };

    connectAndSearch(searchParams);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Force page to scroll to the top on reload
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-4">
      <div className="max-w-full mx-auto px-2 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:gap-0 items-center justify-center space-x-3 mb-4">
            <Network className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-100">
              Six Degrees of Wikipedia
            </h1>
          </div>
          <p className="text-lg text-gray-400 mb-2">
            Explore the threads that tie us together
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
        </div>

        {/* Main Content Grid - 9 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
          {/* Empty left space - 1 part */}
          <div className="hidden lg:block"></div>

          {/* Left Column - Search and Log - 2 parts */}
          <div className="lg:col-span-2 space-y-6">
            <SearchBar
              startPerson={startPerson}
              endPerson={endPerson}
              onStartPersonChange={setStartPerson}
              onEndPersonChange={setEndPerson}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
            
            <LogViewer
              messages={messages}
              isConnected={isConnected}
            />
          </div>

          {/* Middle Column - Visualization - 3 parts */}
          <div className="lg:col-span-3">
            <NetworkVisualization
              activePath={activePath}
              exploredNodes={exploredNodes}
              startPersonId={startPerson?.name}
              endPersonId={endPerson?.name}
            />
          </div>

          {/* Right Column - Path Details - 2 parts */}
          <div className="lg:col-span-2">
            <PathInfo
              path={activePath}
              linkInfo={linkInfo}
            />
          </div>

          {/* Empty right space - 1 part */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
