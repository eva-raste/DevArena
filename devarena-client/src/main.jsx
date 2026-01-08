import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./components/authentication/AuthContext";
import { LoaderProvider } from "./components/loader/LoaderContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <LoaderProvider>

    <AuthProvider>
      <App />
    </AuthProvider>
   </LoaderProvider>

  </BrowserRouter>
);
