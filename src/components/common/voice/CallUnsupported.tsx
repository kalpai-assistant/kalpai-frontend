import React from "react";
import styles from "./CallModal.module.scss";
import { FaPhone } from "react-icons/fa";

interface CallUnsupportedProps {
  onClose: () => void;
}

const CallUnsupported: React.FC<CallUnsupportedProps> = ({ onClose }) => {
  return (
    <div className={styles.callModalOverlay}>
      <div className={styles.callModal}>
        <div className={styles.callContent}>
          <div className={styles.nameContainer}>
            <h2 className={styles.callerName}>Browser Not Supported</h2>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              Voice calling requires Chrome, Edge, or Safari for speech
              recognition support.
            </p>
          </div>
        </div>
        <div className={styles.callControls}>
          <button
            className={`${styles.controlButton} ${styles.endCallButton}`}
            onClick={onClose}
            title="Close"
          >
            <FaPhone />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallUnsupported;
