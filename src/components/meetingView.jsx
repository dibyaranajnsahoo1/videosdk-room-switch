import { useState, useEffect, useMemo, useRef } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { ParticipantView } from "./participantView";
import { Controls } from "./controls";
import { RoomSwitcher } from "./roomSwitcher";
import { MediaRelay } from "./mediaRelay";

export function MeetingView(props) {
  const [connectionState, setConnectionState] = useState("IDLE");
  const [relayPanelOpen, setRelayPanelOpen] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const hasJoinedRef = useRef(false);

  const {
    join,
    participants,
    localParticipant,
    meetingId,
    switchTo,
  } = useMeeting({
    onMeetingJoined: () => {
      setConnectionState("CONNECTED");
      hasJoinedRef.current = true;
    },

    onMeetingLeft: () => {
      // Only reset if user manually left
      setConnectionState("IDLE");
      setRelayPanelOpen(false);
      hasJoinedRef.current = false;
      props.onMeetingLeave?.();
    },

    onSpeakerChanged: (id) => {
      setActiveSpeakerId(id);
    },

    onError: (err) => {
      console.log("Meeting Error:", err);
      setConnectionState("IDLE");
      hasJoinedRef.current = false;
    },
  });

  /* ---------------- Initial Join ---------------- */

  useEffect(() => {
    if (!props.meetingId) return;
    if (hasJoinedRef.current) return;

    setConnectionState("CONNECTING");

    const timer = setTimeout(() => {
      join();
    }, 150);

    return () => clearTimeout(timer);
  }, [props.meetingId]);

  /* ---------------- Participants ---------------- */

  const remoteParticipants = useMemo(() => {
    if (!participants) return [];
    return [...participants.keys()].filter(
      (id) => id !== localParticipant?.id
    );
  }, [participants, localParticipant]);

  const totalParticipants =
    remoteParticipants.length + (localParticipant ? 1 : 0);

  /* ---------------- Join Handler ---------------- */

  const handleJoin = () => {
    if (hasJoinedRef.current) return;

    setConnectionState("CONNECTING");
    join();
  };

  /* ---------------- SWITCH USING switchTo ---------------- */

  const handleSwitch = async (targetRoom, targetRoomId) => {
    if (connectionState !== "CONNECTED") return;
    if (!switchTo) return;

    try {
      setIsSwitching(true);
      setConnectionState("CONNECTING");
      setRelayPanelOpen(false);

      // If you use short-lived tokens, fetch fresh token here
      const token = props.token;

      await switchTo({
        meetingId: targetRoomId,
        token,
      });

      // Inform parent about new room
      props.onSwitchRoom?.(targetRoom, targetRoomId);

      setConnectionState("CONNECTED");
    } catch (err) {
      console.log("Switch error:", err);
      setConnectionState("CONNECTED");
    } finally {
      setIsSwitching(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="vds-layout-root">
      {/* Top Bar */}
      <div className="vds-topbar">
        <div className="vds-room-info">
          <h2>Room {props.currentRoom}</h2>
          <span className="vds-room-id">{meetingId}</span>
        </div>

        {connectionState === "CONNECTED" && (
          <div className="vds-participant-stats">
            {totalParticipants} Participants
          </div>
        )}
      </div>

      {/* CONNECTED STATE */}
      {connectionState === "CONNECTED" ? (
        <>
          <div className="vds-switcher-section">
            <RoomSwitcher
              currentRoom={props.currentRoom}
              onSwitchRoom={handleSwitch}
              roomAId={props.roomAId}
              roomBId={props.roomBId}
              isTransitioning={isSwitching}
            />
          </div>

          <div className="vds-stage-area">
            <div
              className={`vds-grid-container ${
                totalParticipants === 1 ? "single-user" : ""
              }`}
            >
              {localParticipant && (
                <ParticipantView
                  key={localParticipant.id}
                  participantId={localParticipant.id}
                  isActiveSpeaker={
                    activeSpeakerId === localParticipant.id
                  }
                />
              )}

              {remoteParticipants.map((id) => (
                <ParticipantView
                  key={id}
                  participantId={id}
                  isActiveSpeaker={activeSpeakerId === id}
                />
              ))}

              {totalParticipants === 0 && (
                <div className="vds-empty-state">
                  Waiting for participants...
                </div>
              )}
            </div>
          </div>

          <div className="vds-bottom-panel">
            <Controls
              onShowRelay={() =>
                setRelayPanelOpen((prev) => !prev)
              }
            />
          </div>

          {relayPanelOpen && (
            <div className="vds-relay-drawer">
              <MediaRelay
                currentRoom={props.currentRoom}
                roomAId={props.roomAId}
                roomBId={props.roomBId}
                localParticipantId={localParticipant?.id}
              />
            </div>
          )}
        </>
      ) : connectionState === "CONNECTING" ? (
        /* CONNECTING STATE */
        <div className="vds-connecting-screen">
          <div className="vds-loader-circle"></div>
          <h3>
            {isSwitching
              ? `Switching to Room ${props.currentRoom}...`
              : `Joining Room ${props.currentRoom}...`}
          </h3>
          <span>{props.meetingId}</span>
        </div>
      ) : (
        /* PREJOIN */
        <div className="vds-prejoin-screen">
          <div className="vds-prejoin-card">
            <h3>Ready to Join Room {props.currentRoom}?</h3>
            <p>{props.meetingId}</p>
            <button
              className="vds-join-button"
              onClick={handleJoin}
            >
              Join Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
