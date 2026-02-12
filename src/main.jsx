import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ClassroomSeating from "../classroom.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClassroomSeating />
  </StrictMode>
);
