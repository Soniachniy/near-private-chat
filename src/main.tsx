import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ThemeProvider from "./components/common/ThemeProvider";
import { initI18n } from "./i18n";

const initApp = async () => {
  await initI18n(localStorage?.locale);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: false,
      },
    },
  });

  createRoot(document.getElementById("root")!).render(
    // <React.StrictMode> // React strict mode make two socket connection in dev mode
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
        {/* <ReactQueryDevtools initialIsOpen={true} /> */}
      </QueryClientProvider>
    </>
    // </React.StrictMode>
  );
};

initApp();
