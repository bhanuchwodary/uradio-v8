
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import StationsPage from "@/pages/StationsPage";
import AddStationPage from "@/pages/AddStationPage";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="streamify-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stations" element={<StationsPage />} />
          <Route path="/add" element={<AddStationPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
