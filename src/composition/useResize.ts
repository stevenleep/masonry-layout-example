import { onMounted, onUnmounted, watch } from "vue";
import { MaybeElement } from "../types";

export function useWindowResize(listener: (e: UIEvent) => void) {
  onMounted(() => {
    window.addEventListener("resize", listener);
  });
  onUnmounted(() => {
    window.removeEventListener("resize", listener);
  });
}

export function useObserverResize(
  el: MaybeElement,
  listener: (e: ResizeObserverEntry[]) => void,
  options?: ResizeObserverOptions & { automatic?: boolean }
) {
  let observer: ResizeObserver | null = null;
  const isSupported = window && "ResizeObserver" in window;
  const { automatic = false, ...resizeOptions } = options || {};

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  const stopWatch = watch(
    () => el,
    (el) => {
      cleanup();
      if (el && isSupported) {
        observer = new ResizeObserver(listener);
        observer.observe(el, resizeOptions);
      }
    },
    { flush: "post", immediate: true }
  );

  const stop = () => {
    stopWatch();
    cleanup();
  };

  if (automatic) {
    onUnmounted(stop);
  }

  return {
    stop,
    observer,
    isSupported,
  };
}
