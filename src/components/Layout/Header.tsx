
import React from 'react';
import { Shuffle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '../../contexts/PlayerContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { randomMode, setRandomMode, audioState } = usePlayer();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/playlist', label: 'Playlist' },
    { path: '/add-station', label: 'Add Station' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png"
            alt="uRadio"
            className="h-8 w-auto"
          />
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                onClick={() => navigate(item.path)}
                className="text-sm"
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {audioState.currentTrack && (
            <div className="hidden sm:block text-sm">
              <span className="font-medium truncate max-w-48">
                {audioState.currentTrack.name}
              </span>
              {audioState.isPlaying && (
                <span className="text-primary ml-2">♪</span>
              )}
            </div>
          )}

          <Button
            variant={randomMode ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setRandomMode(!randomMode)}
            title={randomMode ? 'Random mode on' : 'Random mode off'}
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/add-station')}
            title="Add station"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
