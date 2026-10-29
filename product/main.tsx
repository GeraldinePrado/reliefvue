import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./App";
import "./app.css";

const container = document.getElementById("root");
if (!container) throw new Error("Product root element is missing.");

createRoot(container).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
