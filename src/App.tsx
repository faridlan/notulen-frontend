import { BrowserRouter, Routes, Route } from "react-router-dom";

import MinutesList from "./pages/MinutesList";
import MinuteDetail from "./pages/MinuteDetail";

import ResultsList from "./pages/ResultsList";
import ResultDetail from "./pages/ResultDetail";

import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";



import { ToastProvider } from "./components/common/ToastProvider";
import Layout from "./components/Layout";
import PublicRoute from "./components/routes/PublicRoute";
import ProtectedRoute from "./components/routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* PROTECTED ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/minutes"
            element={
              <ProtectedRoute>
                <Layout>
                  <MinutesList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/minutes/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <MinuteDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResultsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResultDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
