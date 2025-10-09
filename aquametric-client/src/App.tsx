import CsvIngestion from "./components/CsvIngestion";

export default function App() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>AquaMetric Frontend</h1>
      <p>API: {import.meta.env.VITE_API_URL}</p>
      <CsvIngestion />
    </main>
  );
}