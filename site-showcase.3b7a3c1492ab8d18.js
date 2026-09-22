(function initializeYmBridgeShowcases() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("showcase-enhanced");

  function activate(showcase, value, moveFocus) {
    const tabs = [...showcase.querySelectorAll("[data-showcase-tab]")];
    const panels = [...showcase.querySelectorAll("[data-showcase-panel]")];
    const nextTab = tabs.find(tab => tab.dataset.showcaseTab === value) || tabs[0];
    if (!nextTab) return;

    for (const tab of tabs) {
      const selected = tab === nextTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    }

    for (const panel of panels) {
      const selected = panel.dataset.showcasePanel === nextTab.dataset.showcaseTab;
      panel.hidden = !selected;
      panel.classList.toggle("showcase-panel-active", selected);
    }

    showcase.dataset.showcaseActive = nextTab.dataset.showcaseTab;
  }

  for (const showcase of document.querySelectorAll("[data-showcase]")) {
    const tabs = [...showcase.querySelectorAll("[data-showcase-tab]")];
    const initial = showcase.dataset.showcaseDefault
      || tabs.find(tab => tab.getAttribute("aria-selected") === "true")?.dataset.showcaseTab
      || tabs[0]?.dataset.showcaseTab;
    activate(showcase, initial, false);

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(showcase, tab.dataset.showcaseTab, false));
      tab.addEventListener("keydown", event => {
        let nextIndex = index;
        const horizontalStep = document.documentElement.dir === "rtl" ? -1 : 1;
        if (event.key === "ArrowRight") nextIndex = (index + horizontalStep + tabs.length) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - horizontalStep + tabs.length) % tabs.length;
        else if (event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(showcase, tabs[nextIndex].dataset.showcaseTab, true);
      });
    });
  }

  const revealItems = [...document.querySelectorAll(".reveal-on-scroll")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(item => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8%", threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));
})();
