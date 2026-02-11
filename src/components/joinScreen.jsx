

import { useState } from "react";

export function LobbyScreen({
  onJoinRoom,
  roomAId,
  roomBId,
  roomsReady,
}) {
  const [name, setName] = useState("");

  const handleJoin = (room) => {
    const finalName =
      name.trim() || `User-${Math.floor(Math.random() * 10000)}`;
    onJoinRoom(room, finalName);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-box">
        <h1 className="logo">VideoSDK</h1>
        <p className="tagline">Secure HD Video Meetings</p>

        {!roomsReady ? (
          <div className="loader-section">
            <div className="spinner"></div>
            <p>Preparing Rooms...</p>
          </div>
        ) : (
          <>
            <input
              className="name-input"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="room-grid">
              <div className="room-card">
                <h3>Room A</h3>
                <p>{roomAId}</p>
                <button
                  className="join-btn blue"
                  onClick={() => handleJoin("A")}
                >
                  Join
                </button>
              </div>

              <div className="room-card">
                <h3>Room B</h3>
                <p>{roomBId}</p>
                <button
                  className="join-btn green"
                  onClick={() => handleJoin("B")}
                >
                  Join
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
