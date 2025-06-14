
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export type RequestStationFormData = {
  requestType: string;
  stationName: string;
  stationUrl: string;
  language: string;
  description: string;
  contactEmail: string;
  existingStationUrl: string;
};

interface RequestStationFormProps {
  formData: RequestStationFormData;
  onInputChange: (field: keyof RequestStationFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RequestStationForm: React.FC<RequestStationFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Request Type */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Request Type</Label>
        <RadioGroup
          value={formData.requestType}
          onValueChange={(value) => onInputChange("requestType", value)}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="add" id="add" />
            <Label htmlFor="add" className="cursor-pointer">
              Add New Station
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="modify" id="modify" />
            <Label htmlFor="modify" className="cursor-pointer">
              Modify Existing Station
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Station Name */}
      <div className="space-y-2">
        <Label htmlFor="stationName" className="text-base font-medium">
          {formData.requestType === "modify"
            ? "Existing Station Name"
            : "Station Name"}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="stationName"
          value={formData.stationName}
          onChange={(e) => onInputChange("stationName", e.target.value)}
          placeholder={
            formData.requestType === "modify"
              ? "Enter existing station name to be modified"
              : "Enter station name"
          }
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
            onChange={(e) => onInputChange("stationUrl", e.target.value)}
            placeholder="https://example.com/stream"
            required
          />
        </div>
      )}

      {/* New Station URL - for modifications */}
      {formData.requestType === "modify" && (
        <div className="space-y-2">
          <Label htmlFor="existingStationUrl" className="text-base font-medium">
            New Station URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="existingStationUrl"
            type="url"
            value={formData.existingStationUrl}
            onChange={(e) =>
              onInputChange("existingStationUrl", e.target.value)
            }
            placeholder="Enter new station URL to replace the existing one"
            required
          />
        </div>
      )}

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language" className="text-base font-medium">
          Language
        </Label>
        <Input
          id="language"
          value={formData.language}
          onChange={(e) => onInputChange("language", e.target.value)}
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
          onChange={(e) => onInputChange("contactEmail", e.target.value)}
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
          onChange={(e) => onInputChange("description", e.target.value)}
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
  );
};

export default RequestStationForm;
