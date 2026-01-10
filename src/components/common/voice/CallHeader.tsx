import React from "react";
import styles from "./CallModal.module.scss";

interface CallHeaderProps {
  statusText: string;
  formattedDuration: string;
}

const CallHeader: React.FC<CallHeaderProps> = ({
  statusText,
  formattedDuration,
}) => {
  return (
    <div className={styles.callHeader}>
      <div className={styles.callStatus}>
        <span className={styles.statusText}>{statusText}</span>
        <span className={styles.callTimer}>{formattedDuration}</span>
      </div>
    </div>
  );
};

export default CallHeader;
