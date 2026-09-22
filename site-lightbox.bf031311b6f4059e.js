(function initializeImageLightbox() {
  const selector = [
    ".guide-figure img",
    ".screenshot-board img",
    ".showcase-stage img",
    ".document-showcase img"
  ].join(",");
  const triggers = [...document.querySelectorAll(selector)];
  if (!triggers.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlay = document.createElement("div");
  const preview = document.createElement("img");
  const closeButton = document.createElement("button");

  overlay.className = "image-lightbox";
  overlay.hidden = true;
  overlay.dataset.imageLightbox = "";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  preview.className = "image-lightbox-preview";
  preview.alt = "";
  preview.draggable = false;

  closeButton.className = "image-lightbox-close";
  closeButton.type = "button";
  closeButton.dataset.imageLightboxClose = "";
  closeButton.setAttribute("aria-label", document.documentElement.lang === "he"
    ? "סגירת תצוגת התמונה" : "Close image preview");
  closeButton.textContent = "\u00d7";

  overlay.append(preview, closeButton);
  document.body.append(overlay);

  let activeTrigger = null;
  let closeTimer = 0;
  let previousOverflow = "";
  let previousPaddingLeft = "";
  let previousPaddingRight = "";

  function finishClose() {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
    overlay.hidden = true;
    preview.removeAttribute("src");
    document.body.classList.remove("image-lightbox-open");
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingLeft = previousPaddingLeft;
    document.body.style.paddingRight = previousPaddingRight;
    activeTrigger?.setAttribute("aria-expanded", "false");
    activeTrigger?.focus({ preventScroll: true });
    activeTrigger = null;
  }

  function closeLightbox() {
    if (overlay.hidden) return;
    overlay.classList.remove("is-open");
    if (reduceMotion) finishClose();
    else closeTimer = window.setTimeout(finishClose, 180);
  }

  function openLightbox(trigger) {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
    activeTrigger = trigger;
    previousOverflow = document.body.style.overflow;
    previousPaddingLeft = document.body.style.paddingLeft;
    previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const rootBorder = parseFloat(getComputedStyle(document.documentElement).borderLeftWidth) || 0;
      const scrollbarOnLeft = document.documentElement.clientLeft > rootBorder;
      const paddingSide = scrollbarOnLeft ? "paddingLeft" : "paddingRight";
      const existingPadding = parseFloat(getComputedStyle(document.body)[paddingSide]) || 0;
      document.body.style[paddingSide] = `${existingPadding + scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    document.body.classList.add("image-lightbox-open");

    preview.src = trigger.currentSrc || trigger.src;
    preview.alt = trigger.alt || "";
    overlay.setAttribute("aria-label", trigger.alt || document.title);
    trigger.setAttribute("aria-expanded", "true");
    overlay.hidden = false;

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      closeButton.focus({ preventScroll: true });
    });
  }

  for (const trigger of triggers) {
    trigger.classList.add("image-zoom-trigger");
    trigger.tabIndex = 0;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", () => openLightbox(trigger));
    trigger.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openLightbox(trigger);
    });
  }

  closeButton.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", event => {
    if (event.target === overlay || event.target === preview) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.hidden) {
      event.preventDefault();
      closeLightbox();
    }
  });
})();
