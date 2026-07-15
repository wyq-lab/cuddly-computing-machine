"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Pose } from "@mediapipe/pose";

interface UsePoseOptions {
  onAbsence?: (absentMinutes: number) => void;
  absenceThreshold?: number; // minutes, default 5
  minSessionDuration?: number; // minutes, default 15
  onShortSession?: () => void;
  onDurationUpdate?: (seconds: number) => void;
}

export function usePose({
  onAbsence,
  absenceThreshold = 5,
  minSessionDuration = 15,
  onShortSession,
  onDurationUpdate,
}: UsePoseOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPresent, setIsPresent] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);

  const absentSince = useRef<number | null>(null);
  const notifiedAbsence = useRef(false);
  const notifiedShort = useRef(false);
  const startTime = useRef(Date.now());
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 5 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
      startTime.current = Date.now();

      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        const hasFace =
          results.poseLandmarks &&
          (results.poseLandmarks[0] || results.poseLandmarks[1]);
        setIsPresent(!!hasFace);

        if (!hasFace) {
          if (!absentSince.current) {
            absentSince.current = Date.now();
            notifiedAbsence.current = false;
          }

          const absentMin =
            (Date.now() - absentSince.current) / 1000 / 60;
          if (absentMin >= absenceThreshold && !notifiedAbsence.current) {
            notifiedAbsence.current = true;
            onAbsence?.(Math.floor(absentMin));
          }
        } else {
          absentSince.current = null;
          notifiedAbsence.current = false;
        }
      });

      // Process frames
      const processFrame = async () => {
        if (!videoRef.current || !streamRef.current) return;
        await pose.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };
      processFrame();

      // Duration timer
      const timer = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        setTotalDuration(duration);
        onDurationUpdate?.(duration);
      }, 1000);

      return () => clearInterval(timer);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, [absenceThreshold, onAbsence, onDurationUpdate]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);

    const durationMin = totalDuration / 60;
    if (durationMin < minSessionDuration && !notifiedShort.current) {
      notifiedShort.current = true;
      onShortSession?.();
    }
  }, [totalDuration, minSessionDuration, onShortSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraOn,
    isPresent,
    totalDuration,
    startCamera,
    stopCamera,
  };
}
