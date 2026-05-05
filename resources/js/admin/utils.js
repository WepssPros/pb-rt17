export function cnValue(...values) {
    return values.filter(Boolean).join(" ");
}

export function formatNumber(value) {
    const numeric = Number.parseFloat(value ?? 0);
    return Number.isFinite(numeric)
        ? new Intl.NumberFormat("id-ID").format(numeric)
        : "0";
}

export function formatCurrency(value) {
    const numeric = Number.parseFloat(value ?? 0);
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function parseCurrencyInput(value) {
    return String(value ?? "").replace(/[^\d]/g, "");
}

export function formatCurrencyInput(value) {
    const clean = parseCurrencyInput(value);
    if (!clean) {
        return "";
    }

    return new Intl.NumberFormat("id-ID").format(Number(clean));
}

export function stripHtml(value) {
    return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getCsrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

export async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            ...options.headers,
        },
        ...options,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof payload === "string"
                ? payload.slice(0, 200)
                : payload?.message || "Request gagal";
        throw new Error(message);
    }

    return payload;
}

export async function sendForm(url, values, options = {}) {
    const body =
        values instanceof FormData
            ? values
            : new URLSearchParams(values).toString();

    const headers =
        values instanceof FormData
            ? {
                  "X-CSRF-TOKEN": getCsrfToken(),
                  "X-Requested-With": "XMLHttpRequest",
                  ...(options.headers || {}),
              }
            : {
                  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "X-CSRF-TOKEN": getCsrfToken(),
                  "X-Requested-With": "XMLHttpRequest",
                  ...(options.headers || {}),
              };

    const response = await fetch(url, {
        method: options.method || "POST",
        credentials: "same-origin",
        headers,
        body,
        redirect: "follow",
    });

    if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const json = await response.json();
            throw new Error(json?.message || "Request gagal");
        }

        throw new Error("Request gagal");
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    return { success: true };
}

export function buildNestedParams(entries) {
    const params = new URLSearchParams();

    entries.forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        params.append(key, value);
    });

    return params;
}

export function toRouteKey(routeName = "") {
    return routeName.replace(/\./g, "-");
}

export function percentage(value) {
    const numeric = Number.parseFloat(value ?? 0);
    return `${numeric.toFixed(2)}%`;
}

export function isoToIndoDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function todayYmd() {
    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Jakarta",
    }).format(new Date());
}
