import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "123";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-[Inter]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-80 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-300 bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            className="border w-full px-3 py-2 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password"
            className="border w-full px-3 py-2 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
