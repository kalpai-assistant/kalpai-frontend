import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { GenericModal } from "../../utilComponents/Modal";
import BusinessData from "../business/BusinessData";
import { Button } from "@mantine/core";
import styles from "./PostBusinessRegister.module.scss";

interface PostBusinessRegisterProps {
  businessData: Record<string, unknown>;
  businessID: number;
  onSubmit: () => void;
  isLoading: boolean;
}

const PostBusinessRegister = ({
  businessData,
  businessID,
  onSubmit,
  isLoading,
}: PostBusinessRegisterProps) => {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(true);

  const onInternarlSubmit = () => {
    onSubmit();
    close();
  };

  const handleClose = () => {
    close();
    navigate("/login"); // Navigate to login when modal is closed
  };

  return (
    <GenericModal
      title="Your Business is Registered"
      disclosure={[opened, { open, close: handleClose }]} // Use custom close handler
      size="80%"
      showButton={false}
    >
      <div className={styles.container}>
        <p className={styles.description}>Please confirm your business data</p>
        <div className={styles.businessDataContainer}>
          <BusinessData
            businessData={businessData}
            atLogin
            businessId={businessID}
          />
        </div>
        <Button
          mt="lg"
          className={styles.submitButton}
          onClick={onInternarlSubmit}
          disabled={isLoading}
        >
          Lets Go!
        </Button>
      </div>
    </GenericModal>
  );
};

export default PostBusinessRegister;
