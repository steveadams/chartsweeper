import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // TODO: Check if this is still necessary (issue with XState)
    'process.env': process.env,
  },
});
