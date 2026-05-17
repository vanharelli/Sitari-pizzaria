type LockdownOptions = {
  enabled?: boolean;
};

export function initLockdown(options: LockdownOptions = {}) {
  const enabled = options.enabled ?? true;
  if (!enabled) return;

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const key = String(e.key || "").toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    const blocked =
      key === "f12" ||
      (ctrl && key === "u") ||
      (ctrl && key === "c") ||
      (ctrl && key === "s") ||
      (ctrl && key === "p") ||
      (ctrl && shift && (key === "i" || key === "j" || key === "c"));

    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  window.addEventListener("contextmenu", onContextMenu, { capture: true });
  window.addEventListener("keydown", onKeyDown, { capture: true });
}
