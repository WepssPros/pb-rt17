import React, { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import { AdminLayout } from "@/admin/layout";
import { getAdminPage } from "@/admin/page-registry";

class AdminErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error("Admin runtime error:", error);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="min-h-screen bg-slate-950 p-8 text-white">
                    <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-950/40 p-6">
                        <p className="text-xs uppercase tracking-[0.24em] text-red-300">
                            React Runtime Error
                        </p>
                        <h1 className="mt-3 text-2xl font-semibold">
                            UI admin gagal dirender
                        </h1>
                        <p className="mt-3 text-sm text-red-100/80">
                            {this.state.error?.message || "Unknown error"}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export function AdminApp({ bootstrap }) {
    const [theme, setTheme] = React.useState(
        () => window.__PBRT_THEME__ || bootstrap.initialTheme || "light"
    );
    const PageComponent = getAdminPage(bootstrap.pageKey);

    useEffect(() => {
        if (bootstrap.flash?.success) {
            toast.success(bootstrap.flash.success);
        }

        if (bootstrap.flash?.error) {
            toast.error(bootstrap.flash.error);
        }
    }, [bootstrap.flash]);

    return (
        <TooltipProvider>
            <AdminErrorBoundary>
                <AdminLayout bootstrap={bootstrap} theme={theme} onThemeChange={setTheme}>
                    <PageComponent bootstrap={bootstrap} />
                </AdminLayout>
            </AdminErrorBoundary>
            <Toaster richColors position="top-right" theme={theme} />
        </TooltipProvider>
    );
}
