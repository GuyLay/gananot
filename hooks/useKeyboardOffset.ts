import { useEffect, useState } from "react";

/**
 * Returns the height (px) that the iOS soft keyboard is covering.
 * Uses window.visualViewport which shrinks when the keyboard appears.
 * Returns 0 on desktop or when keyboard is hidden.
 */
export function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vp = window.visualViewport;
    if (!vp) return;

    function update() {
      const kb = window.innerHeight - vp!.height - (vp!.offsetTop ?? 0);
      setOffset(Math.max(0, kb));
    }

    vp.addEventListener("resize", update);
    vp.addEventListener("scroll", update);
    update();

    return () => {
      vp.removeEventListener("resize", update);
      vp.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}
