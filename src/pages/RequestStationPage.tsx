import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

const RequestStationPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    requestType: "add",
    stationName: "",
    stationUrl: "",
    language: "",
    description: "",
    contactEmail: "",
    existingStationUrl: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.stationName || !formData.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.requestType === "add" && !formData.stationUrl) {
      toast({
        title: "Missing Station URL",
        description: "Please provide the station URL for new station requests",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.requestType === "modify" && !formData.existingStationUrl) {
      toast({
        title: "Missing Station URL",
        description: "Please provide the existing station URL for modification requests",
        variant: "destructive"
      });
      return;
    }

    // Create email content
    const subject = formData.requestType === "add" 
      ? `New Station Request: ${formData.stationName}`
      : `Station Modification Request: ${formData.stationName}`;
      
    const body = `
Station Request Details:
------------------------
Request Type: ${formData.requestType === "add" ? "Add New Station" : "Modify Existing Station"}
Station Name: ${formData.stationName}
${formData.requestType === "add" ? `Station URL: ${formData.stationUrl}` : `Existing Station URL: ${formData.existingStationUrl}`}
Language: ${formData.language || "Not specified"}
Contact Email: ${formData.contactEmail}

Description:
${formData.description || "No additional description provided"}

---
This request was submitted via uRadio app.
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:bhanuprabhakar.b@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    toast({
      title: "Email Opened",
      description: "Your email client has been opened with the request details. Please send the email to complete your request.",
    });
    
    // Reset form
    setFormData({
      requestType: "add",
      stationName: "",
      stationUrl: "",
      language: "",
      description: "",
      contactEmail: "",
      existingStationUrl: ""
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl space-y-6">
        <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Request Station
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Request to add a new station or modify an existing one
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Request Type</Label>
                <RadioGroup
                  value={formData.requestType}
                  onValueChange={(value) => handleInputChange("requestType", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add" className="cursor-pointer">Add New Station</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modify" id="modify" />
                    <Label htmlFor="modify" className="cursor-pointer">Modify Existing Station</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Station Name */}
              <div className="space-y-2">
                <Label htmlFor="stationName" className="text-base font-medium">
                  Station Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stationName"
                  value={formData.stationName}
                  onChange={(e) => handleInputChange("stationName", e.target.value)}
                  placeholder="Enter station name"
                  required
                />
              </div>

              {/* Station URL - for new stations */}
              {formData.requestType === "add" && (
                <div className="space-y-2">
                  <Label htmlFor="stationUrl" className="text-base font-medium">
                    Station URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stationUrl"
                    type="url"
                    value={formData.stationUrl}
                    onChange={(e) => handleInputChange("stationUrl", e.target.value)}
                    placeholder="https://example.com/stream"
                    required
                  />
                </div>
              )}

              {/* Existing Station URL - for modifications */}
              {formData.requestType === "modify" && (
                <div className="space-y-2">
                  <Label htmlFor="existingStationUrl" className="text-base font-medium">
                    Existing Station URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="existingStationUrl"
                    type="url"
                    value={formData.existingStationUrl}
                    onChange={(e) => handleInputChange("existingStationUrl", e.target.value)}
                    placeholder="Current station URL to be modified"
                    required
                  />
                </div>
              )}

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-base font-medium">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange("language", e.target.value)}
                  placeholder="e.g., English, Spanish, French"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-base font-medium">
                  Your Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Additional Details
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder={
                    formData.requestType === "add" 
                      ? "Provide any additional information about the station, genre, or special requirements..."
                      : "Describe what changes you'd like to make to the existing station..."
                  }
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Request
              </Button>
            </form>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This will open your default email client with a pre-filled message. 
                Please send the email to complete your request. We'll review your submission and get back to you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RequestStationPage;
