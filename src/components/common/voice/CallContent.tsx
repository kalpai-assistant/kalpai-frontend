import React from "react";
import { Avatar } from "@chatscope/chat-ui-kit-react";
import styles from "./CallModal.module.scss";

interface CallContentProps {
  chatHeadName: string;
  chatHead: string;
}

const CallContent: React.FC<CallContentProps> = ({
  chatHeadName,
  chatHead,
}) => {
  return (
    <div className={styles.callContent}>
      <div className={styles.avatarContainer}>
        <Avatar
          name={chatHeadName}
          src={chatHead}
          className={styles.callAvatar}
        />
      </div>
      <div className={styles.nameContainer}>
        <h2 className={styles.callerName}>{chatHeadName}</h2>
      </div>
    </div>
  );
};

export default CallContent;
