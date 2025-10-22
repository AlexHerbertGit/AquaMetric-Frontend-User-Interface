import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopNav from "./components/TopNav";
import Protected from "./components/Protected";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VesselCreate from "./pages/VesselCreate";
import VesselList from "./pages/VesselList";
import TripCreate from "./pages/TripCreate";
import CsvIngestion from "./pages/CsvIngestion";

export default function App() {
  return (
      <BrowserRouter>
      <div className="app-shell">
        <TopNav />
        <main className="app-shell__main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

          {/* placeholders to implement next */}
            <Route path="/trips/:tripId/upload" element={<Protected><div style={{ padding: 16 }}>CSV upload</div></Protected>} />
            <Route path="/vessels/new" element={<Protected><VesselCreate /></Protected>} />
            <Route path="/vessels" element={<Protected><VesselList /></Protected>} />
            <Route path="/trips/new" element={<Protected><TripCreate /></Protected>} />
            <Route path="/ingestion" element={<CsvIngestion />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
