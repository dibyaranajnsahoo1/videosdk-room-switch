
import { useEffect, useState, useRef } from "react";

export function AudioIndicator({ stream, displayName }) {
  const [audioLevel, setAudioLevel] = useState(0);
  const frameRef = useRef(null);
  const contextRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const dataRef = useRef(null);

  useEffect(() => {
    if (!stream || !stream.track) {
      setAudioLevel(0);
      return;
    }

    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;

      const mediaStream = new MediaStream([stream.track]);
      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      contextRef.current = audioCtx;
      analyserNodeRef.current = analyser;
      dataRef.current = new Uint8Array(analyser.frequencyBinCount);

      const detect = () => {
        analyser.getByteFrequencyData(dataRef.current);

        let sum = 0;
        for (let i = 0; i < dataRef.current.length; i++) {
          sum += dataRef.current[i];
        }

        const avg = sum / dataRef.current.length;
        const normalized = Math.min(1, avg / 60);
        setAudioLevel(normalized);

        frameRef.current = requestAnimationFrame(detect);
      };

      detect();

      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        if (audioCtx.state !== "closed") audioCtx.close();
      };
    } catch (err) {
      setAudioLevel(0);
    }
  }, [stream]);

  const isSpeaking = audioLevel > 0.05;
  const scale = 1 + audioLevel * 0.6;
  const glowOpacity = audioLevel;

  return (
    <div className="voice-indicator-wrapper">
      <div
        className={`voice-ring ${isSpeaking ? "active" : ""}`}
        style={{
          transform: `scale(${scale})`,
          boxShadow: `0 0 20px rgba(0, 255, 0, ${glowOpacity})`,
        }}
      ></div>

      <div className="voice-bar-container">
        <div
          className="voice-bar-fill"
          style={{
            width: `${audioLevel * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
