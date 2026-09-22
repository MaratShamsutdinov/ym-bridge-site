(function initializeThemeBootstrap() {
  const storageKey = "ym-bridge-site-theme";
  const supportedThemes = new Set(["auto", "light", "dark"]);
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

  const normalizeTheme = value => supportedThemes.has(value) ? value : null;

  const readPreference = () => {
    try {
      return normalizeTheme(window.localStorage.getItem(storageKey)) || "auto";
    } catch {
      return "auto";
    }
  };

  let preference = readPreference();

  const resolveTheme = () => preference === "auto"
    ? (systemTheme.matches ? "light" : "dark")
    : preference;

  const updateThemeMeta = theme => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#f4f7f6" : "#101618";
  };

  const updateControls = () => {
    document.querySelectorAll("[data-theme-picker]").forEach(picker => {
      const button = picker.querySelector("[data-theme-button]");
      const activeOption = picker.querySelector(`[data-theme-option="${preference}"]`);
      const themeName = picker.querySelector("[data-theme-name]")?.textContent.trim() || "Theme";
      const preferenceName = activeOption?.querySelector("[data-theme-label]")?.textContent.trim() || preference;

      picker.dataset.themePreference = preference;
      picker.dataset.themeEffective = resolveTheme();
      if (button) {
        const label = `${themeName}: ${preferenceName}`;
        button.setAttribute("aria-label", label);
        button.title = label;
      }

      picker.querySelectorAll("[data-theme-option]").forEach(option => {
        option.setAttribute("aria-checked", String(option === activeOption));
      });
    });
  };

  const applyTheme = () => {
    const theme = resolveTheme();
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.style.colorScheme = theme;
    updateThemeMeta(theme);
    updateControls();
  };

  const closeMenus = exceptPicker => {
    document.querySelectorAll("[data-theme-picker]").forEach(picker => {
      if (picker === exceptPicker) return;
      const menu = picker.querySelector("[data-theme-menu]");
      const button = picker.querySelector("[data-theme-button]");
      if (menu) menu.hidden = true;
      if (button) button.setAttribute("aria-expanded", "false");
    });
  };

  const setPreference = nextPreference => {
    preference = normalizeTheme(nextPreference) || "auto";
    try {
      if (preference === "auto") window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, preference);
    } catch {
      // Theme selection still applies for the current page when storage is unavailable.
    }
    applyTheme();
  };

  const initializeControls = () => {
    document.querySelectorAll("[data-theme-picker]").forEach(picker => {
      const button = picker.querySelector("[data-theme-button]");
      const menu = picker.querySelector("[data-theme-menu]");
      if (!button || !menu) return;

      button.addEventListener("click", () => {
        const willOpen = menu.hidden;
        closeMenus(picker);
        menu.hidden = !willOpen;
        button.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) {
          const activeOption = menu.querySelector(`[data-theme-option="${preference}"]`);
          activeOption?.focus();
        }
      });
      button.addEventListener("keydown", event => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        if (menu.hidden) button.click();
        const options = [...menu.querySelectorAll("[data-theme-option]")];
        (event.key === "ArrowDown" ? options[0] : options.at(-1))?.focus();
      });

      menu.querySelectorAll("[data-theme-option]").forEach(option => {
        option.addEventListener("click", () => {
          setPreference(option.dataset.themeOption);
          closeMenus();
          button.focus();
        });
      });
      menu.addEventListener("keydown", event => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        const options = [...menu.querySelectorAll("[data-theme-option]")];
        const currentIndex = Math.max(0, options.indexOf(document.activeElement));
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? options.length - 1
            : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        event.preventDefault();
        options[nextIndex]?.focus();
      });
    });

    document.addEventListener("click", event => {
      if (!event.target.closest("[data-theme-picker]")) closeMenus();
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const expandedButton = document.querySelector('[data-theme-button][aria-expanded="true"]');
      closeMenus();
      expandedButton?.focus();
    });
    document.addEventListener("ymbridge:localechange", updateControls);
    applyTheme();
  };

  applyTheme();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeControls, { once: true });
  } else {
    initializeControls();
  }

  systemTheme.addEventListener("change", () => {
    if (preference === "auto") applyTheme();
  });

  window.YMBridgeTheme = Object.freeze({
    getPreference: () => preference,
    setPreference
  });
})();
