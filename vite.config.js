import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built site work from any address (own domain, github.io/repo-name, ...)
export default defineConfig({ plugins: [react()], base: "./" });
