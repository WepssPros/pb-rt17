import React from "react";
import { createRoot } from "react-dom/client";

import { AdminApp } from "@/admin/admin-app";

const container = document.getElementById("admin-root");

if (container) {
    const bootstrap = window.__ADMIN_BOOTSTRAP__ || {};
    createRoot(container).render(
        <React.StrictMode>
            <AdminApp bootstrap={bootstrap} />
        </React.StrictMode>
    );
}
