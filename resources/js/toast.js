export function showToast(message, type = "info") {
    let bgClass = "bg-primary";
    if (type === "success") bgClass = "bg-success";
    if (type === "error") bgClass = "bg-danger";
    if (type === "info") bgClass = "bg-info";

    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "position-fixed top-0 end-0 p-3";
        container.style.zIndex = 9999;
        document.body.appendChild(container);
    }

    const toastEl = document.createElement("div");
    toastEl.className = `bs-toast toast fade show ${bgClass}`;
    toastEl.role = "alert";
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
        <div class="toast-header">
            <i class="bx bx-bell me-2"></i>
            <div class="me-auto fw-medium">${
                type.charAt(0).toUpperCase() + type.slice(1)
            }</div>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    container.appendChild(toastEl);

    const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
    bsToast.show();

    toastEl.addEventListener("hidden.bs.toast", () => {
        toastEl.remove();
    });
}

