import { IconRefresh } from "@tabler/icons-react";
import { GenericModal } from "../../utilComponents/Modal";
import { ActionIcon, Button, Textarea, Tooltip } from "@mantine/core";
import styles from "./RegenerateBusinessContext.module.scss";
import { useMutation, useQueryClient } from "react-query";
import { regenerateBusinessData } from "../../../api/business";
import {
  BusinessQueryNames,
  StandardResponse,
} from "../../../api/requests_responses/business";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { useDisclosure } from "@mantine/hooks";

interface RegenerateBusinessContextProps {
  description: string;
  atLogin: boolean;
  businessId?: number;
}

const RegenerateBusinessContext = ({
  description,
  atLogin,
  businessId,
}: RegenerateBusinessContextProps) => {
  const [localDescription, setLocalDescription] = useState<string>(description);

  // Synchronize localDescription with the description prop
  useEffect(() => {
    setLocalDescription(description);
  }, [description]);

  const [opened, { open, close }] = useDisclosure(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    mutate: regenerateBusinessMutation,
    isLoading: regenerateBusinessLoading,
  } = useMutation({
    mutationFn: regenerateBusinessData,
    onSuccess: (data: AxiosResponse<StandardResponse>) => {
      if (data.data.ok) {
        setError(null);
        queryClient.invalidateQueries(
          BusinessQueryNames.GET_USER_BUSINESS_DETAILS,
        );
        close();
      }
    },
    onError: (error) => {
      if (typeof error === "string") {
        setError(error);
      } else if (error instanceof Error) {
        setError(error.message); // Handle error objects
      } else {
        setError("An unexpected error occurred."); // Fallback for unknown error types
      }
    },
  });

  return (
    <GenericModal
      title="Regenerate Business Data"
      displayOnlyIcon
      buttonDisplayIcon={
        <Tooltip label="Regenerate your Business's data">
          <ActionIcon size="lg" variant="filled">
            <IconRefresh size={20} />
          </ActionIcon>
        </Tooltip>
      }
      disclosure={[opened, { open, close }]}
    >
      <div className={styles.regenContainer}>
        <Textarea
          value={localDescription}
          onChange={(event) => setLocalDescription(event.target.value)}
          className={styles.descriptionArea}
          rows={6}
        />
        <Button
          variant="filled"
          onClick={() =>
            regenerateBusinessMutation({
              description: localDescription,
              atLogin,
              business_id: businessId,
            })
          }
          loading={regenerateBusinessLoading}
        >
          <IconRefresh
            size={20}
            fontVariant="light"
            className={classNames({
              [styles.iconRefresh]: regenerateBusinessLoading,
            })}
          />
          Regenerate
        </Button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </GenericModal>
  );
};

export default RegenerateBusinessContext;
