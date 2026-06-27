import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import path from "node:path";

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.js",
                "resources/js/admin/main.jsx",
                "resources/js/ligapayo17/main.jsx",
                "resources/js/auth/login.jsx",
                "resources/js/auth/register.jsx",
                "resources/js/product.js",
                "resources/js/penjualan.js",
                "resources/js/pembelian.js",
                "resources/js/cash.js",
                "resources/js/stock.js",
                "resources/js/roles.js",
                "resources/js/projecttarget.js",
            ],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
        },
    },
});
