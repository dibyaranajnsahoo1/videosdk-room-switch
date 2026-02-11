# 🎥 Dual Room Video Bridge (VideoSDK + React)

A professional dual-room video conferencing system built using VideoSDK React SDK.

This project supports:

- 🔁 Seamless Room Switching using `switchTo`
- 🔴 Dual Room Media Relay (Popup-based live bridge)
- 🎤 Real-time mic & camera controls
- 🟢 Active speaker detection
- 🔄 Auto-reconnect handling
- 💾 Smart session persistence

---

# 📦 Project Setup

## 1️⃣ Install Dependencies

```bash
git clone <your-repository-url>
cd dual-room-video-bridge
npm install
```

---

## 2️⃣ Backend Token API

You must create a backend endpoint:

```
GET /get-token
```

It should return:

```json
{
  "token": "VIDEOSDK_AUTH_TOKEN"
}
```

⚠️ Never expose your VideoSDK secret in frontend.

---

## 3️⃣ Run the Project

```bash
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

# 🏗️ Architecture Overview

```
App
 ├── LobbyScreen
 ├── MeetingView
 │     ├── RoomSwitcher
 │     ├── ParticipantView
 │     ├── Controls
 │     └── MediaRelay
 └── RelayIndicator (Popup Mode)
```

---

# 🧠 Room Initialization

On first load:

1. Auth token is fetched
2. Two rooms are created:
   - Room A
   - Room B
3. Room IDs are stored in sessionStorage

```
videoSDK_roomA
videoSDK_roomB
```

This prevents re-creating rooms on refresh.

---

# 🔁 Room Switching (Using switchTo)

Room switching is handled using:

```js
switchTo({
  meetingId: targetRoomId,
  token
});
```

## Flow:

1. User clicks "Switch Room"
2. `handleSwitch()` is triggered
3. SDK internally reconnects
4. UI updates connection state
5. Media streams reattach automatically

## State Transitions:

```
CONNECTED → CONNECTING → CONNECTED
```

No page reload.
No media reinitialization manually.
No popup window used.

---

# 🔴 Media Relay (Dual Room Bridge)

Media Relay allows a participant to stream in BOTH rooms simultaneously.

Instead of switching rooms, it:

1. Opens a popup window
2. Popup joins the target room
3. Main window stays in current room
4. Media is active in both rooms

---

## Relay URL Format

```
?relay=true
&room=B
&roomId=<roomId>
&name=<participantName>(Relay)
```

---

## Relay Flow

### Main Window:
- Opens popup
- Publishes PubSub message `RELAY_STARTED`
- Starts timer
- Shows LIVE badge

### Popup Window:
- Detects `relay=true`
- Auto joins meeting
- Sends mic & webcam stream

---

## PubSub Channel Used

```js
usePubSub("DUAL_ROOM_BRIDGE")
```

Events:
- RELAY_STARTED
- RELAY_STOPPED

Used for:
- Showing incoming relays
- Syncing state across rooms

---

# 🎥 Participant Rendering

Each participant tile:

- Uses `<VideoPlayer />` for webcam
- Attaches mic manually via `<audio>`
- Handles autoplay restrictions
- Shows manual "Enable Audio" button if blocked
- Highlights active speaker

---

# 🎙️ Active Speaker Detection

Handled via:

```js
onSpeakerChanged
```

Active speaker gets special UI highlight.

---

# 💾 Session Persistence

Stored in:

```
activeRoom
activeMeetingId
activeName
```

Allows:
- Auto rejoin on refresh
- Room memory retention

---

# 🆚 Normal Switching vs Media Relay

| Feature | Room Switching | Media Relay |
|----------|---------------|-------------|
| Joined Rooms | One | Two |
| Uses switchTo | Yes | No |
| Uses Popup | No | Yes |
| Media duplicated | No | Yes |
| CPU usage | Normal | Higher |
| Best For | Moving between rooms | Broadcasting |

---

# ⚠️ Limitations

1. Popup can be blocked by browser.
2. Relay mode increases CPU usage.
3. If tokens expire, switching may fail.
4. No server-level media mixing (client-based duplication).
5. Possible echo if speakers used (use headphones).

---

# 🛠 Production Improvements Suggested

- Role-based relay permission
- Lower resolution in relay mode
- Backend relay coordination
- Dedicated relay badge
- Token refresh before switch
- Reconnection indicator

---

# 📁 Folder Structure

```
/src
  ├── App.jsx
  ├── API.js
  ├── components/
       ├── LobbyScreen.jsx
       ├── MeetingView.jsx
       ├── RoomSwitcher.jsx
       ├── ParticipantView.jsx
       ├── Controls.jsx
       ├── MediaRelay.jsx
       └── AudioIndicator.jsx
```

---

# 🔐 Security Notes

- Always fetch token from backend.
- Never store VideoSDK secret in frontend.
- Validate meeting access server-side if required.

---

# 🧪 Recommended Test Cases

- Switch Room A → B
- Switch repeatedly
- Start Relay
- Close popup manually
- Refresh page during session
- Leave meeting
- Multiple users relay simultaneously

---

# 📌 Summary

This project demonstrates:

- Advanced multi-room WebRTC architecture
- Seamless room switching using switchTo
- Dual-room broadcasting via popup relay
- Real-time PubSub signaling
- State-driven UI transitions
- Clean separation of concerns

This system is suitable for:

- Multi-stage events
- Broadcasting
- Classrooms
- Moderator monitoring
- Dual-channel streaming

---

# 📜 License

MIT
