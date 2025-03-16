import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Music, Upload, Folder } from "lucide-react";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import Navigation from "@/components/Navigation";
import MusicPlayer from "@/components/MusicPlayer";

const LocalFilesPage = () => {
  const {
    tracks,
    currentIndex,
    isPlaying,
    addUrl,
    setCurrentIndex,
    setIsPlaying,
    getAudioElement,
  } = useMusicPlayer();
  
  const { toast } = useToast();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedFiles = localStorage.getItem('localFilesList');
    if (savedFiles) {
      try {
        const fileInfoList = JSON.parse(savedFiles);
        setLocalFiles(fileInfoList.map((info: { name: string }) => ({ name: info.name } as unknown as File)));
      } catch (error) {
        console.error("Error loading saved local files:", error);
      }
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const audioFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        newFiles.push(file);
        audioFiles.push(file);
      }
    }

    audioFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      addUrl(url, file.name);
    });

    const updatedFiles = [...localFiles, ...newFiles];
    setLocalFiles(updatedFiles);
    
    try {
      const fileInfoList = updatedFiles.map(file => ({ name: file.name }));
      localStorage.setItem('localFilesList', JSON.stringify(fileInfoList));
    } catch (error) {
      console.error("Error saving local files list:", error);
    }

    toast({
      title: "Files Added",
      description: `Added ${audioFiles.length} audio files to your playlist`,
    });

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const audioFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        newFiles.push(file);
        audioFiles.push(file);
      }
    }

    audioFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      addUrl(url, file.name);
    });

    const updatedFiles = [...localFiles, ...newFiles];
    setLocalFiles(updatedFiles);
    
    try {
      const fileInfoList = updatedFiles.map(file => ({ name: file.name }));
      localStorage.setItem('localFilesList', JSON.stringify(fileInfoList));
    } catch (error) {
      console.error("Error saving local files list:", error);
    }

    toast({
      title: "Folder Files Added",
      description: `Added ${audioFiles.length} audio files from folder to your playlist`,
    });

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleOpenFolderDialog = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4 md:space-y-6 flex flex-col">
        <Navigation />
        
        <MusicPlayer
          urls={tracks.map(t => t.url)}
          tracks={tracks}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          getAudioElement={getAudioElement}
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Local Audio Files</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <div className="flex flex-col gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                multiple
                className="hidden"
              />
              
              <input
                type="file"
                ref={folderInputRef}
                onChange={handleFolderChange}
                accept="audio/*"
                multiple
                webkitdirectory={true}
                directory={true}
                className="hidden"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleOpenFileDialog}
                  className="flex items-center gap-2 flex-1"
                >
                  <Upload size={16} />
                  Select Files
                </Button>
                
                <Button 
                  onClick={handleOpenFolderDialog}
                  className="flex items-center gap-2 flex-1"
                  variant="secondary"
                >
                  <Folder size={16} />
                  Import Folder
                </Button>
              </div>
              
              <div className="mt-2 space-y-2">
                {localFiles.length > 0 ? (
                  localFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20 cursor-pointer"
                      onClick={() => {
                        const trackIndex = tracks.findIndex(track => 
                          track.name === file.name
                        );
                        if (trackIndex !== -1) {
                          setCurrentIndex(trackIndex);
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <span className="truncate text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 text-white hover:text-white/80"
                      >
                        <Music className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-2 text-gray-400">
                    No local files added yet. Click the buttons above to select audio files or import a folder.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocalFilesPage;
