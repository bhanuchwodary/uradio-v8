
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';

const languages = [
  "English", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada", 
  "Bengali", "Punjabi", "Marathi", "Gujarati", "Classical Music", "Other"
];

interface AddUrlFormProps {
  onAddUrl: (url: string, name: string, language: string) => boolean;
}

const validateUrl = (url: string): boolean => {
  try {
    // Simple check for URL syntax
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const AddUrlForm: React.FC<AddUrlFormProps> = ({ onAddUrl }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!url) {
      setError('URL is required');
      return;
    }
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    
    if (!name) {
      setError('Name is required');
      return;
    }
    
    if (!language) {
      setError('Language is required');
      return;
    }
    
    // Submit form if validation passes
    const success = onAddUrl(url, name, language);
    
    // Reset form if successful
    if (success) {
      setUrl('');
      setName('');
      setLanguage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Station URL</Label>
        <Input
          id="url"
          type="text"
          placeholder="https://example.com/stream"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Station Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="My Favorite Station"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <Button type="submit" className="w-full">
        Add Station
      </Button>
    </form>
  );
};

export default AddUrlForm;
