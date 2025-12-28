import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Get base path from environment variable or default to '/'
  // For GitHub Pages, set this to your repository name (e.g., '/personalwebsite/')
  // For custom domain, use '/'
  let base = process.env.VITE_BASE_PATH || '/';
  // Ensure base path starts with '/' and ends with '/'
  if (!base.startsWith('/')) {
    base = '/' + base;
  }
  if (base !== '/' && !base.endsWith('/')) {
    base = base + '/';
  }

  return {
    base,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
