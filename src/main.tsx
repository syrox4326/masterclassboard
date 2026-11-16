import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/700-italic.css";
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
