
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface AddUrlFormProps {
  onAddUrl: (url: string, name: string) => void;
}

interface FormValues {
  url: string;
  name: string;
}

const AddUrlForm: React.FC<AddUrlFormProps> = ({ onAddUrl }) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      url: "",
      name: ""
    }
  });

  const handleSubmit = (values: FormValues) => {
    const { url, name } = values;
    
    // Basic URL validation
    try {
      // Make sure it's a valid URL
      new URL(url);
      
      // Accept any URL that looks like a media URL or stream URL
      // This includes URLs with audio file extensions, m3u8, or URLs containing "stream", "radio", etc.
      const fileExtension = url.split('.').pop()?.toLowerCase();
      const validExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'm3u8', 'pls', 'asx'];
      const isStreamUrl = 
        url.includes('stream') || 
        url.includes('radio') || 
        url.includes('audio') || 
        url.includes('music') || 
        url.includes('live') ||
        url.includes('/hls/');
      
      if (validExtensions.includes(fileExtension || '') || isStreamUrl) {
        onAddUrl(url, name || `Station ${Date.now()}`);
        form.reset();
      } else {
        toast({
          title: "Unsupported URL format",
          description: "Please enter a URL that points to an audio file or streaming service (mp3, m3u8, etc.)",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="Enter audio URL or stream URL (mp3, m3u8)"
                  className="bg-white/20 backdrop-blur-sm border-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Station Name (optional)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter station name"
                  className="bg-white/20 backdrop-blur-sm border-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-none">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Station
        </Button>
      </form>
    </Form>
  );
};

export default AddUrlForm;
