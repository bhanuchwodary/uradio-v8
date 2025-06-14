
export interface RequestFormData {
  requestType: string;
  stationName: string;
  stationUrl: string;
  language: string;
  description: string;
  contactEmail: string;
  existingStationUrl: string;
}

export const initialFormData: RequestFormData = {
  requestType: "add",
  stationName: "",
  stationUrl: "",
  language: "",
  description: "",
  contactEmail: "",
  existingStationUrl: ""
};
