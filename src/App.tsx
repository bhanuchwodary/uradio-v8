
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TrackStateProvider } from "@/context/TrackStateContext";
import AddStationPage from "@/pages/AddStationPage";
import NotFound from "@/pages/NotFound";
import StationListPage from "@/pages/StationListPage";
import RequestStationPage from "@/pages/RequestStationPage";
import Index from "@/pages/Index";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="uradio-theme">
      <TrackStateProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/playlist" element={<Navigate to="/" />} />
            <Route path="/add" element={<AddStationPage />} />
            <Route path="/add-station" element={<Navigate to="/add" />} />
            <Route path="/station-list" element={<StationListPage />} />
            <Route path="/request-station" element={<RequestStationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </TrackStateProvider>
    </ThemeProvider>
  );
};

export default App;
