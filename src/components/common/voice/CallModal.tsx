import React from "react";
import styles from "./CallModal.module.scss";
import CallHeader from "./CallHeader";
import CallContent from "./CallContent";
import CallControls from "./CallControls";
import CallUnsupported from "./CallUnsupported";
import useCallController from "../../../hooks/voice/useCallController";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHeadName: string;
  chatHead: string;
  sessionToken: string;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  chatHeadName,
  chatHead,
  sessionToken,
}) => {
  const {
    browserSupportsSpeechRecognition,
    statusText,
    formattedDuration,
    isMuted,
    isMobile,
    isSpeakerOn,
    onToggleMute,
    onToggleSpeaker,
    onEndCall,
  } = useCallController({ isOpen, onClose, sessionToken });

  if (!isOpen) return null;

  if (!browserSupportsSpeechRecognition) {
    return <CallUnsupported onClose={onEndCall} />;
  }

  return (
    <div className={styles.callModalOverlay}>
      <div className={styles.callModal}>
        <CallHeader
          statusText={statusText}
          formattedDuration={formattedDuration}
        />
        <CallContent chatHeadName={chatHeadName} chatHead={chatHead} />
        <CallControls
          isMuted={isMuted}
          isMobile={isMobile}
          isSpeakerOn={isSpeakerOn}
          onToggleMute={onToggleMute}
          onToggleSpeaker={onToggleSpeaker}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
};

export default CallModal;
