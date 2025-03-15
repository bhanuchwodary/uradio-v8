
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MusicPlayer from "@/components/MusicPlayer";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Music, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const {
    urls,
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
  } = useMusicPlayer();
  
  // Show only first 3 stations in the preview
  const previewTracks = tracks.slice(0, 3);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <Navigation />

        <MusicPlayer
          urls={urls}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Recent Stations</CardTitle>
            </CardHeader>
            <CardContent>
              {previewTracks.length > 0 ? (
                <div className="space-y-2">
                  {previewTracks.map((track, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20"
                    >
                      <span className="truncate text-sm mr-2">{track.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 text-white hover:text-white/80"
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsPlaying(true);
                        }}
                      >
                        <Music className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No stations added yet.
                </div>
              )}
              
              <div className="mt-4">
                <Link to="/playlist">
                  <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-none">
                    <Music className="w-4 h-4 mr-2" />
                    View All Stations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/add-station">
                <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-none">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New Station
                </Button>
              </Link>
              
              <Link to="/playlist">
                <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-none">
                  <Music className="w-4 h-4 mr-2" />
                  Manage Playlist
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
