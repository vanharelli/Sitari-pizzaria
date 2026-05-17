type LockdownOptions = {
  enabled?: boolean;
};

export function initLockdown(options: LockdownOptions = {}) {
  const enabled = options.enabled ?? true;
  if (!enabled) return;

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  let lastTouchY = 0;
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    lastTouchY = e.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
      return;
    }
    if (e.touches.length !== 1) return;
    const y = e.touches[0]?.clientY ?? 0;
    const dy = y - lastTouchY;
    lastTouchY = y;

    const root = document.scrollingElement || document.documentElement;
    const atTop = (root.scrollTop || 0) <= 0;
    if (atTop && dy > 0) {
      e.preventDefault();
    }
  };

  const onGesture = (e: Event) => {
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
  window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
  window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
  window.addEventListener("gesturestart", onGesture as EventListener, {
    capture: true,
    passive: false,
  });
  window.addEventListener("gesturechange", onGesture as EventListener, {
    capture: true,
    passive: false,
  });
  window.addEventListener("gestureend", onGesture as EventListener, {
    capture: true,
    passive: false,
  });
}
