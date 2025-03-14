
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Music, Radio } from "lucide-react";
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
    
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }
    
    // Basic URL validation
    try {
      // Try to create a URL object to validate basic URL structure
      new URL(url);
      
      // Accept any kind of URL
      const trackName = name.trim() || `Track ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
      onAddUrl(url, trackName);
      setUrl("");
      setName("");
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  const isStreamUrl = url.includes('stream') || url.includes('radio');
  const Icon = isStreamUrl ? Radio : Music;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter track name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-white/20 backdrop-blur-sm border-none"
        />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="url"
            placeholder="Enter audio URL or stream URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-sm border-none pl-9"
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <Button type="submit" variant="outline" className="bg-white/20 backdrop-blur-sm border-none">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddUrlForm;
