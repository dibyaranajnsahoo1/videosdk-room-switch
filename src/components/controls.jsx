import { useMeeting } from "@videosdk.live/react-sdk";

export function Controls({ onShowRelay }) {
  const { leave, toggleMic, toggleWebcam, localMicOn, localWebcamOn } = useMeeting();
  
  return (
    <div className="controls">
      <button 
        className={`control-btn ${localMicOn ?  "inactive" : "active" }`}
        onClick={() => toggleMic()}
      >
        {localMicOn ?  "Mic Off" : "Mic On" }
      </button>
      
      <button 
        className={`control-btn ${localWebcamOn ?  "inactive" : "active"}`}
        onClick={() => toggleWebcam()}
      >
        {localWebcamOn ?  "Cam Off" : "Cam On" }
      </button>
      
      <button 
        className="control-btn relay-btn"
        onClick={onShowRelay}
      >
        Media Relay
      </button>
      
      <button 
        className="control-btn leave-btn"
        onClick={() => leave()}
      >
        Leave
      </button>
    </div>
  );
}