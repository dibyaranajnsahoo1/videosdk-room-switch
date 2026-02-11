# 🎥 Participant Room Switch using VideoSDK (VideoSDK + React)

A professional Participant Room Switch Video conferencing system built using VideoSDK React SDK.

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
git clone (https://github.com/dibyaranajnsahoo1/videosdk-room-switch)
cd videosdk-room-switch
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

⚠️ Never expose your VideoSDK secret in the frontend.

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

# ⚠️ Notes on Limitations, Challenges, and Differences Between Normal Switching and Media Relay

This section explains the architectural differences, trade-offs, and practical limitations between normal room switching (`switchTo`) and Media Relay (dual-room popup broadcasting).

---

# 1️⃣ Core Architectural Difference

## 🔁 Normal Room Switching

- User is connected to **only one room at a time**
- Uses VideoSDK's built-in `switchTo()` method
- Old connection is gracefully replaced
- Media transport is internally re-established
- No additional browser windows
- Only one active WebRTC peer connection

This is a controlled SDK-level reconnection.

---

## 🔴 Media Relay Switching

- User remains in current room
- A **new popup window** joins the target room
- Two independent WebRTC connections run simultaneously
- Media is encoded and transmitted twice
- Client acts as a manual "bridge"

This is client-level duplication, not server-side bridging.

---

# 2️⃣ Resource Consumption Differences

## Normal Switching

- 1 WebRTC connection
- 1 audio encoder
- 1 video encoder
- Lower CPU usage
- Lower bandwidth usage

Ideal for regular users moving between rooms.

---

## Media Relay

- 2 WebRTC connections
- 2 audio encoders
- 2 video encoders
- Higher CPU load
- Higher memory usage
- Nearly double bandwidth usage

On low-end devices this may cause:
- Frame drops
- Audio delay
- Heating issues

---

# 3️⃣ Performance Implications

## Switching

When switching:

```
CONNECTED → CONNECTING → CONNECTED
```

Temporary reconnection occurs but:
- Only one transport active
- Short reconnect delay
- No media duplication

Switching is optimized by SDK.

---

## Relay

When relay starts:
- Main window stays connected
- Popup creates entirely new connection
- Media is streamed in both rooms simultaneously
- Encoding workload doubles

Relay mode should not be used continuously for long sessions on low hardware systems.

---

# 4️⃣ Network Behavior

## Normal Switching

- Stops sending packets to old room
- Starts sending to new room
- Clean migration
- Minimal packet duplication

---

## Media Relay

- Sends packets to two SFUs
- Doubles outbound bitrate
- Can trigger network congestion
- May cause:
  - Packet loss
  - Increased jitter
  - Temporary freezing

Especially noticeable on slower internet connections.

---

# 5️⃣ Token and Authentication Challenges

## Switching

- Uses same token (if valid)
- If token expires → switching fails
- May require token refresh logic

---

## Relay

- Popup requires valid token
- If token expires:
  - Popup fails to join
  - Relay stops unexpectedly
- Needs token lifecycle management

Production systems should implement:
- Token refresh before relay
- Expiry monitoring

---

# 6️⃣ Popup Window Limitations

Media Relay depends on:

```
window.open()
```

Modern browsers may:

- Block popup automatically
- Restrict autoplay
- Restrict camera access in popup

User must manually allow:
- Popups
- Microphone
- Camera

This does not affect normal switching.

---

# 7️⃣ Audio Feedback & Echo Risk

## Switching

Only one active session.
No duplication of microphone input.

Echo risk: Low.

---

## Relay

Two sessions using same microphone.

If:
- User uses speakers (not headphones)
- Both rooms play audio loudly

Echo loop may occur.

Recommended:
- Use headphones in relay mode.

---

# 8️⃣ UI & State Complexity

## Switching

- Single connection state
- Single participant list
- Clean UI transitions
- Easier to manage

---

## Relay

- Two independent connection contexts
- Main window + popup state
- PubSub synchronization required
- Manual relay status tracking
- Timer handling
- Popup close detection

Relay significantly increases UI and state complexity.

---

# 9️⃣ Failure Scenarios

## Normal Switching Failure Cases

- Token expired
- Network drop
- SDK reconnection failure

Usually recoverable via reconnect.

---

## Relay Failure Cases

- Popup blocked
- Popup manually closed
- Token expired
- Internet instability
- CPU overload
- Browser crash

Relay introduces more failure points.

---

# 🔟 Scalability Considerations

## Switching

Scales well for:
- Large meetings
- Multiple users switching rooms
- Production environments

---

## Relay

Not ideal for:
- Many simultaneous relays
- Large number of broadcasters

If 10 users relay:
→ 20 total active streams

This increases server and client load dramatically.

Server-side media mixing is better for large-scale bridging.

---

# 1️⃣1️⃣ Security Considerations

## Switching

Secure and controlled.
Uses existing authenticated session.

---

## Relay

Popup URL contains:
- roomId
- name
- relay flag

Must ensure:
- Token validation
- Access control server-side
- No unauthorized relay joining

---

# 1️⃣2️⃣ When To Use What

## Use Normal Switching When:

- User needs to move between rooms
- Performance matters
- System must scale
- Clean architecture preferred

---

## Use Media Relay When:

- Broadcaster must appear in both rooms
- Moderator monitoring needed
- Cross-room live streaming required
- Temporary bridging scenario

Relay is powerful but heavier.

---

# 🏁 Final Technical Summary

| Category | Normal Switching | Media Relay |
|------------|------------------|-------------|
| Rooms Connected | 1 | 2 |
| WebRTC Connections | 1 | 2 |
| CPU Usage | Low | High |
| Bandwidth | Low | High |
| Popup Required | No | Yes |
| Complexity | Low | High |
| Stability | High | Moderate |
| Best For | Room navigation | Broadcasting |

---

# 🚀 Conclusion

Normal switching is:

✔ Efficient  
✔ Stable  
✔ Production friendly  

Media relay is:

✔ Flexible  
✔ Powerful  
✔ Resource intensive  

Both approaches serve different architectural purposes.

A well-designed production system should use:

- Switching for navigation
- Relay for controlled broadcasting scenarios
- Server-level bridging for large-scale enterprise use


