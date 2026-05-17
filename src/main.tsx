import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/animations_led.css";
import { initLockdown } from "./logic/lockdown";

initLockdown();

document.documentElement.style.overflowY = "auto";
document.body.style.overflowY = "auto";
document.documentElement.style.touchAction = "auto";
document.body.style.touchAction = "auto";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
