import { useState, useEffect, useRef } from "react";

export function useOneSignal() {
  const [oneSignalId, setOneSignalId] = useState<string | null>(null);
  const activeNotificationIdRef = useRef<string | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  useEffect(() => {
    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
      await OneSignal.init({
        appId: "fb88458d-29aa-47c2-ba1c-ab3c117132fe",
      });

      // Get current subscription ID
      const subId = OneSignal.User.PushSubscription.id;
      setOneSignalId(subId || null);

      // Listen for subscription changes
      OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
        setOneSignalId(event.current.id || null);
      });
    });
  }, []);

  const requestNotificationPermission = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      setShowIOSPrompt(true);
      return;
    }

    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(async function(OneSignal: any) {
      try {
        await OneSignal.Notifications.requestPermission();
        const subId = OneSignal.User.PushSubscription.id;
        if (subId) {
          setOneSignalId(subId);
        }
      } catch (err) {
        console.error("Failed to request permission:", err);
      }
    });
  };

  const scheduleNotification = async (seconds: number, timerMode: "focus" | "short" | "long") => {
    if (!oneSignalId) {
      setNotificationStatus("No subscription ID found");
      return;
    }
    await cancelNotification(); // Cancel existing scheduled alert first
    setNotificationStatus("Scheduling background alarm...");

    const title = timerMode === "focus" ? "Break Time! ☕" : "Focus Time! 💻";
    const message = timerMode === "focus" 
      ? "Great job focusing! Take a well-deserved break." 
      : "Break is over. Let's get back to building!";

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: oneSignalId,
          seconds,
          title,
          message
        })
      });
      const data = await response.json();
      if (response.ok && data.notificationId) {
        activeNotificationIdRef.current = data.notificationId;
        setNotificationStatus("Alarm scheduled in background");
      } else {
        setNotificationStatus(`Failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error("Failed to schedule background notification:", err);
      setNotificationStatus(`Network error: ${err.message || 'Failed to connect'}`);
    }
  };

  const cancelNotification = async () => {
    if (!activeNotificationIdRef.current) return;
    try {
      setNotificationStatus("Cancelling background alarm...");
      const response = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: activeNotificationIdRef.current
        })
      });
      const data = await response.json();
      if (response.ok) {
        activeNotificationIdRef.current = null;
        setNotificationStatus(null);
      } else {
        setNotificationStatus(`Cancel Failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error("Failed to cancel background notification:", err);
      setNotificationStatus(`Cancel error: ${err.message || 'Failed'}`);
    }
  };

  return {
    oneSignalId,
    showIOSPrompt,
    setShowIOSPrompt,
    notificationStatus,
    setNotificationStatus,
    requestNotificationPermission,
    scheduleNotification,
    cancelNotification,
  };
}
