/* ------------------------------------------------------------------ */
/* Shared UI helpers and session handling                              */
/* Used by admin.html (with admin.js) and student.html (with          */
/* student.js). Load this file first: both role scripts rely on it.    */
/* ------------------------------------------------------------------ */

/* SVG icons from the sprite in admin.html / student.html (feather-style,
   stroke = currentColor) */
const ICONS = {
  check: '<svg><use href="#i-check"></use></svg>',
  x: '<svg><use href="#i-x"></use></svg>',
  alert: '<svg><use href="#i-alert"></use></svg>',
  info: '<svg><use href="#i-info"></use></svg>',
  clock: '<svg><use href="#i-clock"></use></svg>',
  bell: '<svg><use href="#i-bell"></use></svg>',
  lock: '<svg><use href="#i-lock"></use></svg>',
  reset: '<svg><use href="#i-reset"></use></svg>',
  trash: '<svg><use href="#i-trash"></use></svg>',
  download: '<svg><use href="#i-download"></use></svg>',
  help: '<svg><use href="#i-help"></use></svg>',
};

const TOAST_ICONS = {
  success: ICONS.check,
  error: ICONS.x,
  warning: ICONS.alert,
  info: ICONS.info,
};

/* ------------------------------------------------------------------ */
/* Toast notifications + confirm dialogs                               */
/* ------------------------------------------------------------------ */

function showToast(message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || ICONS.info}</span>
    <span class="toast-msg"></span>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;
  toast.querySelector(".toast-msg").textContent = message;
  toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains("toast-out")) return;
  toast.classList.add("toast-out");
  setTimeout(() => toast.remove(), 300);
}

/**
 * Promise-based confirmation dialog. Resolves true on confirm, false on
 * cancel / overlay click / Escape.
 */
function showConfirmDialog({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, icon = ICONS.help }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="confirm-icon ${danger ? "confirm-icon-danger" : ""}">${icon}</div>
        <h3 class="confirm-title"></h3>
        <div class="confirm-message"></div>
        <div class="confirm-actions">
          <button class="btn secondary confirm-cancel"></button>
          <button class="btn ${danger ? "remove" : "primary"} confirm-ok"></button>
        </div>
      </div>
    `;
    overlay.querySelector(".confirm-title").textContent = title;
    overlay.querySelector(".confirm-message").innerHTML = message;
    overlay.querySelector(".confirm-cancel").textContent = cancelLabel;
    overlay.querySelector(".confirm-ok").textContent = confirmLabel;

    const cleanup = (result) => {
      overlay.removeEventListener("keydown", onKey);
      overlay.remove();
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === "Escape") cleanup(false);
      if (e.key === "Enter" && document.activeElement.classList.contains("confirm-ok")) cleanup(true);
    };
    overlay.querySelector(".confirm-ok").addEventListener("click", () => cleanup(true));
    overlay.querySelector(".confirm-cancel").addEventListener("click", () => cleanup(false));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.querySelector(".confirm-ok").focus(), 50);
  });
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

function formatDateTime(value) {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch (e) {
    return value;
  }
}

/* ------------------------------------------------------------------ */
/* Session / navigation helpers                                        */
/* ------------------------------------------------------------------ */

function handleLogout() {
  clearSessionData();
  window.location.href = "/logout";
}

function clearSessionData() {
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
}

/**
 * Confirms the server session still exists and matches the role this page was
 * rendered for. Redirects to the login page otherwise, so a stale or
 * wrong-role tab never keeps calling authenticated endpoints.
 */
async function ensureSession(expectedRole) {
  try {
    const response = await fetch("/api/user-info", { method: "GET", credentials: "include" });
    if (response.ok) {
      const userInfo = await response.json();
      if (userInfo.authenticated && (!expectedRole || userInfo.role === expectedRole)) {
        sessionStorage.setItem("userRole", userInfo.role);
        sessionStorage.setItem("userEmail", userInfo.email || "");
        sessionStorage.setItem("isAuthenticated", "true");
        return true;
      }
    }
  } catch (error) {
    console.error("Error verifying the session:", error);
  }
  clearSessionData();
  window.location.replace("/login");
  return false;
}

function toggleMobileSidebar() {
  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("mobile-open");
    overlay.style.display = sidebar.classList.contains("mobile-open") ? "block" : "none";
  }
}

/* Data loaders registered by admin.js / student.js, keyed by section id. */
const SECTION_LOADERS = {};

function registerSectionLoader(sectionId, loader) {
  SECTION_LOADERS[sectionId] = loader;
}

function switchSection(sectionId, element) {
  document.querySelectorAll(".content-section").forEach((sec) => {
    sec.style.display = "none";
    sec.classList.remove("active");
  });

  const sidebar = document.querySelector(".app-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && sidebar.classList.contains("mobile-open")) {
    sidebar.classList.remove("mobile-open");
    if (overlay) overlay.style.display = "none";
  }

  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));
  if (element) {
    element.classList.add("active");
  } else {
    const activeLink = document.getElementById(`link-${sectionId}`);
    if (activeLink) activeLink.classList.add("active");
  }

  const loader = SECTION_LOADERS[sectionId];
  if (typeof loader === "function") loader();
}
