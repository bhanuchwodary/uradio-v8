
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Music } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddUrlFormProps {
  onAddUrl: (url: string, name: string) => void;
}

const AddUrlForm: React.FC<AddUrlFormProps> = ({ onAddUrl }) => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    try {
      // Make sure it's a valid URL
      new URL(url);
      
      // Accept any URL that looks like a media URL or stream URL
      // This includes URLs with audio file extensions or URLs containing "stream", "radio", etc.
      const fileExtension = url.split('.').pop()?.toLowerCase();
      const validExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
      const isStreamUrl = url.includes('stream') || url.includes('radio') || url.includes('audio') || url.includes('music');
      
      if (validExtensions.includes(fileExtension || '') || isStreamUrl) {
        // Generate a name if not provided
        const trackName = name.trim() || `Track ${new Date().toISOString()}`;
        onAddUrl(url, trackName);
        setUrl("");
        setName("");
      } else {
        toast({
          title: "Unsupported URL format",
          description: "Please enter a URL that points to an audio file or streaming service",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter track name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-white/20 backdrop-blur-sm border-none"
        />
      </div>
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Enter audio URL or stream URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 bg-white/20 backdrop-blur-sm border-none"
        />
        <Button type="submit" variant="outline" className="bg-white/20 backdrop-blur-sm border-none">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddUrlForm;
