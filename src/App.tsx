import { BrowserRouter, Routes, Route } from "react-router-dom";

import MinutesList from "./pages/MinutesList";
import MinuteDetail from "./pages/MinuteDetail";

import ResultsList from "./pages/ResultsList";
import ResultDetail from "./pages/ResultDetail";

import Dashboard from "./pages/Dashboard";

import { ToastProvider } from "./components/common/ToastProvider";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/minutes" element={<MinutesList />} />
            <Route path="/minutes/:id" element={<MinuteDetail />} />

            <Route path="/results" element={<ResultsList />} />
            <Route path="/results/:id" element={<ResultDetail />} />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
