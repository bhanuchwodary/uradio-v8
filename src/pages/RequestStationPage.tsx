
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Radio, Info } from "lucide-react";

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
${formData.requestType === "add" ? `Station URL: ${formData.stationUrl}` : `New Station URL: ${formData.existingStationUrl}`}
Language: ${formData.language || "Not specified"}
Contact Email: ${formData.contactEmail}

Description:
${formData.description || "No additional description provided"}

---
This request was submitted via uRadio app.
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:request.uradio@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full gradient-accent flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Request Station
          </h1>
          <p className="text-on-surface-variant text-lg">
            Help us expand our radio collection by requesting new stations or updates
          </p>
        </div>

        {/* Request Form */}
        <Card className="border-0 elevation-2 bg-gradient-to-br from-surface/90 to-surface-container/60 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-on-surface flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              Station Request Form
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Request Type */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-on-surface">Request Type</Label>
                <RadioGroup
                  value={formData.requestType}
                  onValueChange={(value) => handleInputChange("requestType", value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="add" id="add" className="peer sr-only" />
                    <Label 
                      htmlFor="add" 
                      className="flex flex-col items-center justify-center p-6 bg-surface-container/60 border-2 border-outline-variant/30 rounded-2xl cursor-pointer transition-smooth hover:bg-surface-container-high/60 peer-checked:border-primary peer-checked:bg-primary/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Radio className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold text-on-surface">Add New Station</span>
                      <span className="text-sm text-on-surface-variant mt-1">Request a brand new radio station</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="modify" id="modify" className="peer sr-only" />
                    <Label 
                      htmlFor="modify" 
                      className="flex flex-col items-center justify-center p-6 bg-surface-container/60 border-2 border-outline-variant/30 rounded-2xl cursor-pointer transition-smooth hover:bg-surface-container-high/60 peer-checked:border-primary peer-checked:bg-primary/5"
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                        <Mail className="h-6 w-6 text-secondary" />
                      </div>
                      <span className="font-semibold text-on-surface">Modify Existing</span>
                      <span className="text-sm text-on-surface-variant mt-1">Update an existing station</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Station Name */}
              <div className="space-y-3">
                <Label htmlFor="stationName" className="text-base font-semibold text-on-surface">
                  {formData.requestType === "modify" ? "Existing Station Name" : "Station Name"} 
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="stationName"
                  value={formData.stationName}
                  onChange={(e) => handleInputChange("stationName", e.target.value)}
                  placeholder={formData.requestType === "modify" ? "Enter existing station name to be modified" : "Enter station name"}
                  className="h-12 text-base rounded-xl border-outline-variant/30 bg-surface-container/40 focus:bg-surface-container/60 transition-smooth"
                  required
                />
              </div>

              {/* Station URL - for new stations */}
              {formData.requestType === "add" && (
                <div className="space-y-3">
                  <Label htmlFor="stationUrl" className="text-base font-semibold text-on-surface">
                    Station URL <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="stationUrl"
                    type="url"
                    value={formData.stationUrl}
                    onChange={(e) => handleInputChange("stationUrl", e.target.value)}
                    placeholder="https://example.com/stream"
                    className="h-12 text-base rounded-xl border-outline-variant/30 bg-surface-container/40 focus:bg-surface-container/60 transition-smooth"
                    required
                  />
                </div>
              )}

              {/* New Station URL - for modifications */}
              {formData.requestType === "modify" && (
                <div className="space-y-3">
                  <Label htmlFor="existingStationUrl" className="text-base font-semibold text-on-surface">
                    New Station URL <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="existingStationUrl"
                    type="url"
                    value={formData.existingStationUrl}
                    onChange={(e) => handleInputChange("existingStationUrl", e.target.value)}
                    placeholder="Enter new station URL to replace the existing one"
                    className="h-12 text-base rounded-xl border-outline-variant/30 bg-surface-container/40 focus:bg-surface-container/60 transition-smooth"
                    required
                  />
                </div>
              )}

              {/* Language */}
              <div className="space-y-3">
                <Label htmlFor="language" className="text-base font-semibold text-on-surface">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange("language", e.target.value)}
                  placeholder="e.g., English, Spanish, French"
                  className="h-12 text-base rounded-xl border-outline-variant/30 bg-surface-container/40 focus:bg-surface-container/60 transition-smooth"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-3">
                <Label htmlFor="contactEmail" className="text-base font-semibold text-on-surface">
                  Your Email <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-12 text-base rounded-xl border-outline-variant/30 bg-surface-container/40 focus:bg-surface-container/60 transition-smooth"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-semibold text-on-surface">
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
                  className="text-base rounded-xl border-outline-variant/30 bg-surface-container/40 focus:bg-surface-container/60 transition-smooth resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold rounded-2xl gradient-primary text-white shadow-lg hover:shadow-xl transition-smooth"
              >
                <Send className="h-5 w-5 mr-3" />
                Send Request
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How it works</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    This will open your default email client with a pre-filled message containing all your request details. 
                    Simply send the email and we'll review your submission and get back to you as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RequestStationPage;
