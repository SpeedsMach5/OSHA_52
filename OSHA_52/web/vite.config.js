import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // A production build must point at a real API. Set VITE_API_URL (in Cloudflare Pages: an environment
  // variable); local builds for screenshots set it to the dev API explicitly.
  const env = loadEnv(mode, process.cwd(), '');
  if (command === 'build' && !env.VITE_API_URL && !process.env.VITE_API_URL) {
    throw new Error('VITE_API_URL is not set. Set it to the API address, e.g. https://osha-52-api-production.up.railway.app');
  }
  return {
    plugins: [react()],
    server: { port: 5173 },
    preview: { port: 4173 },
  };
});
