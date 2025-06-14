
import React from "react";

export const RequestStationInfoBox: React.FC = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <strong>Note:</strong> This will open your default email client with a pre-filled message. 
        Please send the email to complete your request. We'll review your submission and get back to you.
      </p>
    </div>
  );
};
