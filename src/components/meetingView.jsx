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

  const hasJoinedRef = useRef(false);
  const isSwitchingRef = useRef(false);

  const {
    join,
    leave,
    participants,
    localParticipant,
    meetingId,
  } = useMeeting({
    onMeetingJoined: () => {
      setConnectionState("CONNECTED");
      hasJoinedRef.current = true;
    },

    onMeetingLeft: () => {
      hasJoinedRef.current = false;

      if (!isSwitchingRef.current) {
        setConnectionState("IDLE");
        setRelayPanelOpen(false);
        props.onMeetingLeave?.();
      }
    },

    onSpeakerChanged: (id) => {
      setActiveSpeakerId(id);
    },

    onError: () => {
      setConnectionState("IDLE");
      hasJoinedRef.current = false;
    },
  });

  

  useEffect(() => {
    if (!props.meetingId) return;

    if (hasJoinedRef.current) return;

    setConnectionState("CONNECTING");

    const timer = setTimeout(() => {
      join();
    }, 150);

    return () => clearTimeout(timer);
  }, [props.meetingId]);

  

  const remoteParticipants = useMemo(() => {
    if (!participants) return [];
    return [...participants.keys()].filter(
      (id) => id !== localParticipant?.id
    );
  }, [participants, localParticipant]);

  const totalParticipants =
    remoteParticipants.length + (localParticipant ? 1 : 0);



  const handleJoin = () => {
    if (hasJoinedRef.current) return;

    setConnectionState("CONNECTING");
    join();
  };


  const handleSwitch = async (room) => {
    if (connectionState !== "CONNECTED") return;

    try {
      isSwitchingRef.current = true;
      setRelayPanelOpen(false);
      setConnectionState("CONNECTING");

      await leave();

      props.onSwitchRoom(room);

    } catch (err) {
      console.log("Switch error:", err);
    } finally {
      isSwitchingRef.current = false;
    }
  };

 

  return (
    <div className="vds-layout-root">

      
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

    
      {connectionState === "CONNECTED" ? (
        <>
          <div className="vds-switcher-section">
            <RoomSwitcher
              currentRoom={props.currentRoom}
              onSwitchRoom={handleSwitch}
              roomAId={props.roomAId}
              roomBId={props.roomBId}
              isTransitioning={props.isTransitioning}
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
        <div className="vds-connecting-screen">
          <div className="vds-loader-circle"></div>
          <h3>Switching to Room {props.currentRoom}...</h3>
          <span>{props.meetingId}</span>
        </div>
      ) : (
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

