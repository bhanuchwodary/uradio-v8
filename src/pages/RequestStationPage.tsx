
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
      <div className="container mx-auto max-w-2xl space-y-6">
        <Card className="bg-surface-container dark:bg-surface-container-high border-none shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-xl font-bold text-on-surface">
                    Request a Station
                    </CardTitle>
                    <p className="text-on-surface-variant text-sm mt-1">
                    Help us grow our library by adding or updating a station.
                    </p>
                </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Request Type */}
              <div className="space-y-3">
                <Label className="font-medium">Request Type</Label>
                <RadioGroup
                  value={formData.requestType}
                  onValueChange={(value) => handleInputChange("requestType", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add" className="cursor-pointer font-normal">Add New Station</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modify" id="modify" />
                    <Label htmlFor="modify" className="cursor-pointer font-normal">Modify Existing Station</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Station Name */}
              <div className="space-y-2">
                <Label htmlFor="stationName" className="font-medium">
                  {formData.requestType === "modify" ? "Existing Station Name" : "Station Name"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stationName"
                  value={formData.stationName}
                  onChange={(e) => handleInputChange("stationName", e.target.value)}
                  placeholder={formData.requestType === "modify" ? "Enter existing station name to be modified" : "Enter station name"}
                  required
                />
              </div>

              {/* Station URL - for new stations */}
              {formData.requestType === "add" && (
                <div className="space-y-2">
                  <Label htmlFor="stationUrl" className="font-medium">
                    Station URL <span className="text-destructive">*</span>
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

              {/* New Station URL - for modifications */}
              {formData.requestType === "modify" && (
                <div className="space-y-2">
                  <Label htmlFor="existingStationUrl" className="font-medium">
                    New Station URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="existingStationUrl"
                    type="url"
                    value={formData.existingStationUrl}
                    onChange={(e) => handleInputChange("existingStationUrl", e.target.value)}
                    placeholder="Enter new station URL to replace the existing one"
                    required
                  />
                </div>
              )}

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="font-medium">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange("language", e.target.value)}
                  placeholder="e.g., English, Spanish, French"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="font-medium">
                  Your Email <span className="text-destructive">*</span>
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
                <Label htmlFor="description" className="font-medium">
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
              <Button type="submit" size="lg" className="w-full flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Request
              </Button>
            </form>

            <div className="bg-primary/10 border-l-4 border-primary text-primary-foreground p-4 rounded-r-lg">
              <p className="text-sm text-on-surface">
                <strong>Note:</strong> This will open your default email client. Please send the email to complete your request.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RequestStationPage;
