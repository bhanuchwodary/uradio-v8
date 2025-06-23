
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '../contexts/PlayerContext';
import { useNavigate } from 'react-router-dom';

export const AddStationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addTrack } = usePlayer();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both name and URL fields',
        variant: 'destructive',
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newTrack = addTrack({
        name: name.trim(),
        url: url.trim(),
        language: language.trim() || undefined,
        isFavorite: false,
        isFeatured: false,
        playTime: 0,
      });

      toast({
        title: 'Station added successfully',
        description: `"${newTrack.name}" has been added to your stations`,
      });

      // Reset form
      setName('');
      setUrl('');
      setLanguage('');
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add station. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Station</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Station Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., BBC Radio 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="url">Stream URL *</Label>
            <Textarea
              id="url"
              placeholder="e.g., https://stream.example.com/radio.mp3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Supports MP3, M3U8 (HLS), and other audio stream formats
            </p>
          </div>

          <div>
            <Label htmlFor="language">Language (optional)</Label>
            <Input
              id="language"
              type="text"
              placeholder="e.g., English, Spanish, French"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Station'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
