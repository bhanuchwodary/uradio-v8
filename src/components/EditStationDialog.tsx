
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditStationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { url: string; name: string; language?: string }) => void;
  initialValues: { url: string; name: string; language?: string };
  error?: string | null;
}

const languages = [
  "English", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada", 
  "Bengali", "Punjabi", "Marathi", "Gujarati", "Classical Music", "Other"
];

const EditStationDialog: React.FC<EditStationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
  error
}) => {
  const [url, setUrl] = useState(initialValues.url);
  const [name, setName] = useState(initialValues.name);
  const [language, setLanguage] = useState(initialValues.language || "English");

  // Update state when initialValues changes
  useEffect(() => {
    setUrl(initialValues.url);
    setName(initialValues.name);
    setLanguage(initialValues.language || "English");
  }, [initialValues]);

  const handleSave = () => {
    onSave({ url, name, language });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Station</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="station-url" className="text-right">
              URL
            </Label>
            <Input
              id="station-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="station-name" className="text-right">
              Name
            </Label>
            <Input
              id="station-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="station-language" className="text-right">
              Language
            </Label>
            <div className="col-span-3">
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
          </div>
          {error && (
            <div className="col-span-4 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStationDialog;
