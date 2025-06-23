
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PlayerProvider } from './contexts/PlayerContext';
import { Header } from './components/Layout/Header';
import { HomePage } from './pages/HomePage';
import { PlaylistPage } from './pages/PlaylistPage';
import { AddStationPage } from './pages/AddStationPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="uradio-theme">
        <PlayerProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Header />
              <main className="pb-4">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/playlist" element={<PlaylistPage />} />
                  <Route path="/add-station" element={<AddStationPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </PlayerProvider>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
