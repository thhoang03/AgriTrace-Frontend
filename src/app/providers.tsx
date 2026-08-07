import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { queryClient } from "./query-client";
import { AuthProvider } from "../features/auth/auth.store";
import { LanguageProvider } from "../contexts/LanguageContext";
import { Toaster } from "sonner";

export default function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton duration={4000} />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
