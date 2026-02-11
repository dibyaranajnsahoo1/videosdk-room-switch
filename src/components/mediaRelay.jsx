import React, { useState, useEffect, useRef } from "react";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";

export function MediaRelay({
  currentRoom,
  roomAId,
  roomBId,
  localParticipantId,
}) {
  const [relayActive, setRelayActive] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [incomingRelays, setIncomingRelays] = useState([]);
  const [relayDuration, setRelayDuration] = useState(0);

  const relayWindow = useRef(null);
  const timerRef = useRef(null);

  const { localParticipant, localMicOn, localWebcamOn } = useMeeting();

  const targetRoom = currentRoom === "A" ? "B" : "A";
  const targetRoomId = currentRoom === "A" ? roomBId : roomAId;
  const activeRoomId = currentRoom === "A" ? roomAId : roomBId;

  const { publish } = usePubSub("DUAL_ROOM_BRIDGE", {
    onMessageReceived: (message) => {
      const data = message.data;

      if (data.type === "RELAY_STARTED" && data.targetRoom === currentRoom) {
        setIncomingRelays((prev) => {
          const exists = prev.find((r) => r.participantId === data.participantId);
          if (!exists) return [...prev, data];
          return prev;
        });
      }

      if (data.type === "RELAY_STOPPED") {
        setIncomingRelays((prev) =>
          prev.filter((r) => r.participantId !== data.participantId)
        );
      }
    },
  });

  const startRelay = async () => {
    if (!localMicOn && !localWebcamOn) {
      setStatusText("Enable Mic or Camera before starting relay");
      return;
    }

    try {
      setStatusText("Connecting to second room...");

      publish(
        {
          type: "RELAY_STARTED",
          sourceRoom: currentRoom,
          targetRoom,
          participantId: localParticipantId,
          participantName: localParticipant?.displayName || "Participant",
          timestamp: Date.now(),
        },
        { persist: true }
      );

      const relayUrl = `${window.location.origin}?relay=true&room=${targetRoom}&roomId=${targetRoomId}&name=${encodeURIComponent(
        localParticipant?.displayName || "Participant"
      )}(Relay)`;

      const popup = window.open(
        relayUrl,
        `dual_${targetRoom}`,
        "width=420,height=320"
      );

      if (!popup) throw new Error("Popup blocked");

      relayWindow.current = popup;
      setRelayActive(true);
      setStatusText(`Live in Room ${currentRoom} & ${targetRoom}`);

      timerRef.current = setInterval(() => {
        setRelayDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setStatusText("Popup blocked. Allow popups.");
      setRelayActive(false);
    }
  };

  const stopRelay = () => {
    if (relayWindow.current && !relayWindow.current.closed) {
      relayWindow.current.close();
    }

    publish({
      type: "RELAY_STOPPED",
      sourceRoom: currentRoom,
      participantId: localParticipantId,
      timestamp: Date.now(),
    });

    clearInterval(timerRef.current);
    setRelayDuration(0);
    setRelayActive(false);
    relayWindow.current = null;
    setStatusText("Relay stopped");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (relayActive && relayWindow.current?.closed) {
        stopRelay();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [relayActive]);

  useEffect(() => {
    return () => {
      if (relayWindow.current && !relayWindow.current.closed) {
        relayWindow.current.close();
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="dual-bridge-wrapper">
      <div className="bridge-card">
        <div className="bridge-top">
          <div>
            <h3 className="bridge-title">Dual Room Relay</h3>
            <span className="bridge-sub">
              Stream to Room {targetRoom}
            </span>
          </div>
          {relayActive && (
            <div className="live-pill">
              LIVE {formatTime(relayDuration)}
            </div>
          )}
        </div>

        <div className="bridge-body">
          <div className="room-meta">
            <div>
              <span>Current</span>
              <strong>Room {currentRoom}</strong>
              <small>{activeRoomId}</small>
            </div>
            <div>
              <span>Target</span>
              <strong>Room {targetRoom}</strong>
              <small>{targetRoomId}</small>
            </div>
          </div>

          <div className="device-status">
            <div className={`device ${localMicOn ? "on" : "off"}`}>
              Mic {localMicOn ? "On" : "Off"}
            </div>
            <div className={`device ${localWebcamOn ? "on" : "off"}`}>
              Cam {localWebcamOn ? "On" : "Off"}
            </div>
          </div>

          {!relayActive ? (
            <button className="bridge-start" onClick={startRelay}>
              Start Relay
            </button>
          ) : (
            <button className="bridge-stop" onClick={stopRelay}>
              Stop Relay
            </button>
          )}

          {statusText && (
            <div className={`bridge-status ${relayActive ? "active" : ""}`}>
              {statusText}
            </div>
          )}

          {incomingRelays.length > 0 && (
            <div className="incoming-list">
              <span>Incoming Relays</span>
              {incomingRelays.map((relay, i) => (
                <div key={i} className="incoming-item">
                  Room {relay.sourceRoom} - {relay.participantName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





