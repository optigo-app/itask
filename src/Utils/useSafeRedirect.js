import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useSafeRedirect() {
  const controllerRef = useRef(null);
  const navigate = useNavigate();

  const safeRedirect = (path) => {
    // Abort previous redirect if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // Create a new controller for the latest click
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    // Very small delay to ensure async cleanup (optional)
    setTimeout(() => {
      if (!signal.aborted) {
        navigate(path);
      }
    }, 10);
  };

  return safeRedirect;
}