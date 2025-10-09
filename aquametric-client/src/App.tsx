import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CsvIngestion from "./components/CsvIngestion";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ingestion" element={<div style={{ padding: 24 }}><h1>Catch File Upload</h1><CsvIngestion /></div>} />
      </Routes>
    </BrowserRouter>
  );
}