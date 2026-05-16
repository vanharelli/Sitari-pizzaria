import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/core.css";
import "./styles/animations_led.css";
import { initLockdown } from "./logic/lockdown";

initLockdown();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
