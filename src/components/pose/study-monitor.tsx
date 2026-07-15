"use client";
import { useEffect, useRef, useState } from "react";
import { usePose } from "@/hooks/use-pose";
import { fetcher } from "@/lib/fetcher";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function StudyMonitor() {
  const sessionRef = useRef<string | null>(null);
  const [showAbsentWarning, setShowAbsentWarning] = useState(false);
  const [showShortWarning, setShowShortWarning] = useState(false);

  const {
    videoRef,
    isCameraOn,
    isPresent,
    totalDuration,
    startCamera,
    stopCamera,
  } = usePose({
    onAbsence: (minutes) => {
      setShowAbsentWarning(true);
    },
    onShortSession: () => {
      setShowShortWarning(true);
    },
  });

  // Start session on mount
  useEffect(() => {
    startCamera();
    fetcher("/api/session", {
      method: "POST",
      body: JSON.stringify({ startTime: new Date().toISOString() }),
    }).then((data) => {
      if (data.session) sessionRef.current = data.session.id;
    });

    // End session on unmount
    return () => {
      if (sessionRef.current) {
        fetcher("/api/session", {
          method: "PATCH",
          body: JSON.stringify({
            sessionId: sessionRef.current,
            endTime: new Date().toISOString(),
          }),
        });
      }
      stopCamera();
    };
  }, []);

  return (
    <>
      <video ref={videoRef} className="hidden" />
      <Dialog open={showAbsentWarning} onOpenChange={setShowAbsentWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>检测到离开</DialogTitle>
            <DialogDescription>
              你已离开学习页面超过 5 分钟。快回来继续学习，坚持就是胜利！
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showShortWarning} onOpenChange={setShowShortWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>学习时长提醒</DialogTitle>
            <DialogDescription>
              本次学习不足 15 分钟，建议至少完成今天的背诵任务再结束。短暂的坚持也能积累成习惯！
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
