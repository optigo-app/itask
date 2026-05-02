import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useSafeRedirect() {
  const controllerRef = useRef(null);
  const navigate = useNavigate();

  const safeRedirect = (path, options = {}) => {
    // Abort previous redirect if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    // Create a new controller for the latest click
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    window.dispatchEvent(
      new CustomEvent("app:route-change-start", {
        detail: { path },
      })
    );

    if (!signal.aborted) {
      navigate(path, options);
    }
  };

  return safeRedirect;
}