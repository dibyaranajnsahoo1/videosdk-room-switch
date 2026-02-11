

import React, { useMemo } from "react";

export function RoomSwitcher({
  currentRoom,
  onSwitchRoom,
  roomAId,
  roomBId,
  isTransitioning,
}) {
  const targetRoom = currentRoom === "A" ? "B" : "A";

  const currentRoomId = useMemo(
    () => (currentRoom === "A" ? roomAId : roomBId),
    [currentRoom, roomAId, roomBId]
  );

  const targetRoomId = useMemo(
    () => (currentRoom === "A" ? roomBId : roomAId),
    [currentRoom, roomAId, roomBId]
  );

  const handleRoomSwitch = () => {
    if (isTransitioning) return;
    onSwitchRoom(targetRoom, targetRoomId);
  };

  return (
    <div className="vds-room-bar">
      <div className="vds-room-left">
        <div className="vds-room-badge active">
          Room {currentRoom}
        </div>
        <div className="vds-room-meta">
          <span className="vds-room-label">Meeting ID</span>
          <span className="vds-room-value">
            {currentRoomId}
          </span>
        </div>
      </div>

      <div className="vds-room-center">
        <div className="vds-room-connector">
          <div className="vds-dot active"></div>
          <div className="vds-line"></div>
          <div className="vds-dot"></div>
        </div>
      </div>

      <div className="vds-room-right">
       <button
          className={`vds-room-switch-btn ${
            isTransitioning ? "loading" : ""
          }`}
          onClick={handleRoomSwitch}
          disabled={isTransitioning || !targetRoomId}
        >
          {isTransitioning
            ? "Switching..."
            : `Switch to Room ${targetRoom}`}
        </button>


        <div className="vds-room-target-info">
          <span>Target</span>
          <strong>Room {targetRoom}</strong>
          <small>{targetRoomId}</small>
        </div>
      </div>
    </div>
  );
}
