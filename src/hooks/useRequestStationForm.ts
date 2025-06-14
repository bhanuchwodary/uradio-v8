
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RequestFormData, initialFormData } from "@/components/request-station/types";

export const useRequestStationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RequestFormData>(initialFormData);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.stationName || !formData.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.requestType === "add" && !formData.stationUrl) {
      toast({
        title: "Missing Station URL",
        description: "Please provide the station URL for new station requests",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.requestType === "modify" && !formData.existingStationUrl) {
      toast({
        title: "Missing Station URL",
        description: "Please provide the existing station URL for modification requests",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const createEmailContent = () => {
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

    return { subject, body };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { subject, body } = createEmailContent();
    const mailtoLink = `mailto:request.uradio@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: "Email Opened",
      description: "Your email client has been opened with the request details. Please send the email to complete your request.",
    });
    
    setFormData(initialFormData);
  };

  return {
    formData,
    handleInputChange,
    handleSubmit
  };
};
