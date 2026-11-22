"use client";
import { useEffect, useRef, useState } from "react";

// Saves only valid, dirty forms. Editors retain their existing conflict handling.
export function useAutosave({
  dirty,
  revision,
  blocked,
  save,
  reconnect,
}: {
  dirty: boolean;
  revision: string;
  blocked: boolean;
  save: () => void;
  reconnect: () => void;
}) {
  const callbacks = useRef({ save, reconnect });
  callbacks.current = { save, reconnect };
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const connected = () => {
      setOnline(true);
      callbacks.current.reconnect();
    };
    const disconnected = () => setOnline(false);
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty]);
  useEffect(() => {
    if (!dirty || blocked || !online) return;
    const timer = setTimeout(() => {
      if (navigator.onLine) callbacks.current.save();
    }, 1000);
    return () => clearTimeout(timer);
  }, [dirty, revision, blocked, online]);
  return online;
}
