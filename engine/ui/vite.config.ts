import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 8001,
        proxy: {
            "/health": "http://localhost:8000",
            "/stats": "http://localhost:8000"
        }
    },
    build: {
        outDir: "../conduit/static",
        emptyOutDir: true
    }
});
