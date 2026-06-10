import { useEffect } from "react";

export function useWakeLock(isActive: boolean) {
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      if ("wakeLock" in navigator && isActive) {
        try {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          console.log("Screen Wake Lock acquired");
        } catch (err) {
          console.error("Failed to acquire Screen Wake Lock:", err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLock) {
        try {
          await wakeLock.release();
          wakeLock = null;
          console.log("Screen Wake Lock released");
        } catch (err) {
          console.error("Failed to release Screen Wake Lock:", err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    if (isActive) {
      requestWakeLock();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActive]);
}
