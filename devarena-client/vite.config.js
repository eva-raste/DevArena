import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from "url"
import path from "path"



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
  // const env = loadEnv(mode, process.cwd(), "");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: env.VITE_API_BASE_URL,
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})
