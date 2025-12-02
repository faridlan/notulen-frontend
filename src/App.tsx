import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MinutesList from "./pages/MinutesList";
import MinuteCreate from "./pages/MinuteCreate";
import MinuteDetail from "./pages/MinuteDetail";
import MinuteEdit from "./pages/MinuteEdit";
import ResultsList from "./pages/ResultsList";
import ResultCreate from "./pages/ResultCreate";
import ResultDetail from "./pages/ResultDetail";
import ResultEdit from "./pages/ResultEdit";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow mb-4">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="font-bold text-lg">Notulen App</h1>
            <nav className="space-x-4 text-sm">
              <Link to="/minutes" className="hover:underline">
                Minutes
              </Link>
              <Link to="/results" className="hover:underline">
                Results
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-8">
          <Routes>
            <Route path="/" element={<MinutesList />} />
            <Route path="/minutes" element={<MinutesList />} />
            <Route path="/minutes/create" element={<MinuteCreate />} />
            <Route path="/minutes/:id" element={<MinuteDetail />} />
            <Route path="/minutes/:id/edit" element={<MinuteEdit />} />

            <Route path="/results" element={<ResultsList />} />
            <Route path="/results/create" element={<ResultCreate />} />
            <Route path="/results/:id" element={<ResultDetail />} />
            <Route path="/results/:id/edit" element={<ResultEdit />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
