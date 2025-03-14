
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddUrlFormProps {
  onAddUrl: (url: string) => void;
}

const AddUrlForm: React.FC<AddUrlFormProps> = ({ onAddUrl }) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    try {
      // Make sure it's a valid URL
      new URL(url);
      
      // Check if it's likely a media URL (basic check)
      const fileExtension = url.split('.').pop()?.toLowerCase();
      const validExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
      
      if (validExtensions.includes(fileExtension || '')) {
        onAddUrl(url);
        setUrl("");
      } else {
        toast({
          title: "Invalid URL format",
          description: "Please enter a URL that points to an audio file (mp3, wav, etc.)",
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="Enter audio URL (mp3, wav, etc.)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 bg-white/20 backdrop-blur-sm border-none"
      />
      <Button type="submit" variant="outline" className="bg-white/20 backdrop-blur-sm border-none">
        <PlusCircle className="w-4 h-4 mr-2" />
        Add
      </Button>
    </form>
  );
};

export default AddUrlForm;
