import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.js",
                "resources/js/product.js",
                "resources/js/penjualan.js",
                "resources/js/pembelian.js",
                "resources/js/cash.js",
                "resources/js/stock.js",
            ],
            refresh: true,
        }),
    ],
});
