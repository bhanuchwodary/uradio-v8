
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStationHeader } from "@/components/request-station/RequestStationHeader";
import { RequestStationForm } from "@/components/request-station/RequestStationForm";
import { RequestStationInfoBox } from "@/components/request-station/RequestStationInfoBox";
import { useRequestStationForm } from "@/hooks/useRequestStationForm";

const RequestStationPage: React.FC = () => {
  const { formData, handleInputChange, handleSubmit } = useRequestStationForm();

  return (
    <AppLayout>
      <div className="container mx-auto max-w-2xl space-y-6 pt-4">
        <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
          <RequestStationHeader />
          
          <CardContent className="space-y-6">
            <RequestStationForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />

            <RequestStationInfoBox />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default RequestStationPage;
