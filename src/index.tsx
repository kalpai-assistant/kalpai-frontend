import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "react-query";
import { MantineProvider } from "@mantine/core";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            // Customize the theme here
            primaryColor: "blue",
          }}
        >
          <App />
        </MantineProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

// reportWebVitals();
