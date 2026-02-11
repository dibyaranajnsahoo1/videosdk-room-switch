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
    if (isTransitioning || !targetRoomId) return;
    onSwitchRoom(targetRoom); // ✅ ONLY room
  };

  return (
    <div className="vds-room-bar">
      <div className="vds-room-left">
        <div className="vds-room-badge active">
          Room {currentRoom}
        </div>

        <div className="vds-room-meta">
          <span>Meeting ID</span>
          <strong>{currentRoomId}</strong>
        </div>
      </div>

      <div className="vds-room-right">
        <button
          className={`vds-room-switch-btn ${
            isTransitioning ? "loading" : ""
          }`}
          onClick={handleRoomSwitch}
          disabled={isTransitioning}
        >
          {isTransitioning
            ? "Switching..."
            : `Switch to Room ${targetRoom}`}
        </button>

        <small>Target: {targetRoomId}</small>
      </div>
    </div>
  );
}
