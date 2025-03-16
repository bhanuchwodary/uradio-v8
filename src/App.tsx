
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import Index from "./pages/Index";
import PlaylistPage from "./pages/PlaylistPage";
import AddStationPage from "./pages/AddStationPage";
import LocalFilesPage from "./pages/LocalFilesPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/playlist" element={<PlaylistPage />} />
          <Route path="/add-station" element={<AddStationPage />} />
          <Route path="/local-files" element={<LocalFilesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
