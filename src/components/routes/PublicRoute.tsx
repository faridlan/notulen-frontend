import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

export default function PublicRoute({ children }: Props) {
  const isLoggedIn = localStorage.getItem("auth") === "true";

  return !isLoggedIn ? children : <Navigate to="/" replace />;
}
