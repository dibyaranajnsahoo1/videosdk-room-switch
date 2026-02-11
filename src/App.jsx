
import "./App.css";
import React, { useEffect, useState } from "react";
import { MeetingProvider, useMeeting } from "@videosdk.live/react-sdk";
import { getAuthToken, createBothRooms } from "./API";
import { LobbyScreen } from "./components/joinScreen";
import { MeetingView } from "./components/meetingView";


function RelayIndicator() {
  const { join, localParticipant } = useMeeting({
    onMeetingJoined: () => {
      console.log("Relay connected");
    },
  });

  useEffect(() => {
    join();
  }, []);

  return (
    <div className="relay-wrapper">
      <div className="relay-circle"></div>
      <h3>Relay Connected</h3>
      {localParticipant && (
        <p>ID: {localParticipant.id?.slice(0, 8)}...</p>
      )}
    </div>
  );
}

function App() {
  const [authToken, setAuthToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [roomAId, setRoomAId] = useState(null);
  const [roomBId, setRoomBId] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [participantName, setParticipantName] = useState("Guest");
  const [meetingKey, setMeetingKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRelayMode, setIsRelayMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getAuthToken();
        setAuthToken(token);

        const storedA = sessionStorage.getItem("videoSDK_roomA");
        const storedB = sessionStorage.getItem("videoSDK_roomB");

        if (storedA && storedB) {
          setRoomAId(storedA);
          setRoomBId(storedB);
        } else {
          const { roomA, roomB } = await createBothRooms(token);
          sessionStorage.setItem("videoSDK_roomA", roomA);
          sessionStorage.setItem("videoSDK_roomB", roomB);
          setRoomAId(roomA);
          setRoomBId(roomB);
        }
      } catch (err) {
        alert("Initialization failed");
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!authToken || !roomAId || !roomBId) return;

    const savedRoom = sessionStorage.getItem("activeRoom");
    const savedMeetingId = sessionStorage.getItem("activeMeetingId");
    const savedName = sessionStorage.getItem("activeName");

    if (savedRoom && savedMeetingId) {
      setCurrentRoom(savedRoom);
      setMeetingId(savedMeetingId);
      setParticipantName(savedName || "Guest");
      setMeetingKey(Date.now());
    }
  }, [authToken, roomAId, roomBId]);

 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("relay") === "true") {
      setIsRelayMode(true);
      setCurrentRoom(params.get("room"));
      setMeetingId(params.get("roomId"));
      setParticipantName(
        params.get("name")
          ? decodeURIComponent(params.get("name"))
          : "Relay User"
      );
      setRoomAId(sessionStorage.getItem("videoSDK_roomA"));
      setRoomBId(sessionStorage.getItem("videoSDK_roomB"));
      setMeetingKey(Date.now());
      window.resizeTo(420, 320);
    }
  }, []);

 
  const joinRoom = (room, name) => {
    const roomId = room === "A" ? roomAId : roomBId;
    if (!roomId) return;

    setParticipantName(name);
    setCurrentRoom(room);
    setMeetingId(roomId);
    setMeetingKey(Date.now());

    sessionStorage.setItem("activeRoom", room);
    sessionStorage.setItem("activeMeetingId", roomId);
    sessionStorage.setItem("activeName", name);
  };

  const switchRoom = (targetRoom) => {
  if (isTransitioning) return;

  const targetRoomId =
    targetRoom === "A" ? roomAId : roomBId;

  if (!targetRoomId) return;

  setIsTransitioning(true);

  setCurrentRoom(targetRoom);
  setMeetingId(targetRoomId);
  setMeetingKey(Date.now());

  sessionStorage.setItem("activeRoom", targetRoom);
  sessionStorage.setItem("activeMeetingId", targetRoomId);

  setTimeout(() => {
    setIsTransitioning(false);
  }, 300);
};


 
  const onMeetingLeave = () => {
    setMeetingId(null);
    setCurrentRoom(null);

    sessionStorage.removeItem("activeRoom");
    sessionStorage.removeItem("activeMeetingId");
    sessionStorage.removeItem("activeName");
  };

  
  return (
    <div className="app-container">
      {isRelayMode ? (
        authToken &&
        meetingId && (
          <MeetingProvider
            key={meetingKey}
            token={authToken}
          config={{
  meetingId,
  name: participantName,
  micEnabled: true,
  webcamEnabled: true,
  reconnect: true,
  maxResolution: "hd",
  mode: "SEND_AND_RECV",
}}

          >
            <RelayIndicator />
          </MeetingProvider>
        )
      ) : authToken && meetingId ? (
        <MeetingProvider
          key={meetingKey}
          token={authToken}
          config={{
  meetingId,
  name: participantName,
  micEnabled: true,
  webcamEnabled: true,
  reconnect: true,
  maxResolution: "hd",
  mode: "SEND_AND_RECV",
}}

        >
          <MeetingView
            meetingId={meetingId}
            currentRoom={currentRoom}
            roomAId={roomAId}
            roomBId={roomBId}
            onSwitchRoom={switchRoom}
            onMeetingLeave={onMeetingLeave}
            isTransitioning={isTransitioning}
          />
        </MeetingProvider>
      ) : (
        <LobbyScreen
          onJoinRoom={joinRoom}
          roomAId={roomAId}
          roomBId={roomBId}
          roomsReady={roomAId && roomBId}
        />
      )}
    </div>
  );
}

export default App;

