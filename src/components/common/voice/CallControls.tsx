import React from "react";
import styles from "./CallModal.module.scss";
import {
  FaPhone,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeDown,
} from "react-icons/fa";

interface CallControlsProps {
  isMuted: boolean;
  isMobile: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isMobile,
  isSpeakerOn,
  onToggleMute,
  onToggleSpeaker,
  onEndCall,
}) => {
  return (
    <div className={styles.callControls}>
      <button
        className={`${styles.controlButton} ${isMuted ? styles.active : ""}`}
        onClick={onToggleMute}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </button>

      {isMobile && (
        <button
          className={`${styles.controlButton} ${
            isSpeakerOn ? styles.active : ""
          }`}
          onClick={onToggleSpeaker}
          title={isSpeakerOn ? "Earpiece" : "Speaker"}
        >
          {isSpeakerOn ? <FaVolumeUp /> : <FaVolumeDown />}
        </button>
      )}

      <button
        className={`${styles.controlButton} ${styles.endCallButton}`}
        onClick={onEndCall}
        title="End Call"
      >
        <FaPhone />
      </button>
    </div>
  );
};

export default CallControls;
