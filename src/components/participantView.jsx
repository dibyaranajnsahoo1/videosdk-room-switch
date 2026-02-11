
import { useEffect, useRef, useState } from "react";
import { useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { AudioIndicator } from "./audioIndicator";

export function ParticipantView({ participantId, isActiveSpeaker }) {
  const audioRef = useRef(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const {
    micStream,
    webcamStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
  } = useParticipant(participantId);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (micOn && micStream?.track) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(micStream.track);

      audioEl.srcObject = mediaStream;
      audioEl.muted = isLocal;

      audioEl.play().catch(() => {
        if (!isLocal) setAudioBlocked(true);
      });
    } else {
      audioEl.srcObject = null;
    }

    return () => {
      if (audioEl) {
        audioEl.srcObject = null;
      }
    };
  }, [micStream, micOn, isLocal]);

  const manuallyEnableAudio = () => {
    if (!audioRef.current || isLocal) return;

    audioRef.current.play().then(() => {
      setAudioBlocked(false);
    });
  };

  return (
    <div
      className={`vds-participant-tile ${
        isActiveSpeaker ? "vds-speaking" : ""
      }`}
    >
      <div className="vds-video-wrapper">
        {webcamOn ? (
          <VideoPlayer
            participantId={participantId}
            type="video"
            containerStyle={{ height: "100%", width: "100%" }}
          />
        ) : (
          <div className="vds-video-placeholder">
            {displayName?.charAt(0)?.toUpperCase()}
          </div>
        )}

        <div className="vds-overlay-top">
          <span className="vds-name-tag">
            {isLocal ? "You" : displayName}
          </span>
        </div>
      </div>

      {audioBlocked && !isLocal && (
        <button
          className="vds-audio-unlock"
          onClick={manuallyEnableAudio}
        >
          Enable Audio
        </button>
      )}

      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}
