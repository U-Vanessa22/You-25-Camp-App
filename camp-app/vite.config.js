import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Try port 3003 first, but allow fallback to next available port
    port: 3003,
    host: '0.0.0.0', // Explicitly bind to all network interfaces
    strictPort: false, // Allow fallback to next available port
    cors: true // Enable CORS for mobile access
  }
})