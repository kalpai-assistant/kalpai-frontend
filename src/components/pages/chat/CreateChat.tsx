import { useNavigate, useParams } from "react-router-dom";
import { ButtonColors } from "../../../utils/constants";
import Button from "../../utilComponents/Button";
import styles from "./CreateChat.module.scss";
import { useMutation, useQuery } from "react-query";
import { createChatSession, getChatHeadDetails } from "../../../api/chat";
import { AxiosResponse } from "axios";
import { GenerateTokenResponse } from "../../../api/requests_responses/business";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { ipHelper } from "../../../utils/utils";
import { Avatar, Flex, Title } from "@mantine/core";
import { ChatQueryNames } from "../../../api/requests_responses/chat";
import { fetchTuid } from "../../../utils/apiUtils";

const CreateChat: React.FC = () => {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState("");
  const [clientIP, setClientIP] = useState<string | null>(null); // State to store IP address
  const [chatHead, setChatHead] = useState<string>("/aria-logo.jpeg");
  const [chatHeadName, setChatHeadName] = useState<string>("Kalp AI");
  const [tuid, setTuid] = useState<string | null>(null); // State to store tuid
  const [isWaitingForTuid, setIsWaitingForTuid] = useState(false); // State to track if we're waiting for tuid

  useEffect(() => {
    // Fetch location
    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject),
        );
        setLocation(position);
      } catch (error) {
        console.error("Welcome!");
      }
    };

    // Fetch IP Address
    const fetchIP = async () => {
      try {
        const ip = await ipHelper();
        setClientIP(ip);
      } catch (error) {
        console.error("WelcomeIPGo!");
      }
    };

    // Fetch tuid
    const getTuid = async () => {
      try {
        const data = await fetchTuid();
        if (data && data.tuid) {
          setTuid(data.tuid);
        }
      } catch (error) {
        console.error("Error fetching tuid:", error);
      }
    };

    getLocation();
    fetchIP();
    getTuid(); // Start fetching tuid as soon as component mounts
  }, []);

  const businessID = Number(useParams().businessID);
  const navigate = useNavigate();

  const { isLoading } = useQuery(
    ChatQueryNames.GET_CHAT_HEAD_DETAILS,
    () =>
      getChatHeadDetails({ business_id: businessID }).then((res) => res.data),
    {
      onSuccess: (data) => {
        setChatHead(data.chat_head_url);
        setChatHeadName(data.chat_head_name);
      },
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: createChatMutation, isLoading: createChatMutationLoading } =
    useMutation({
      mutationFn: createChatSession,
      onSuccess: (data: AxiosResponse<GenerateTokenResponse>) => {
        if (data.data.token) {
          setError("");
          navigate(`/chat/${data.data.token}`);
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

  const handleButtonClick = () => {
    if (error) {
      window.location.reload();
      return;
    }

    if (createChatMutationLoading) return;

    if (businessID) {
      // If tuid is not available yet, wait for it
      if (!tuid && !isWaitingForTuid) {
        setIsWaitingForTuid(true);

        // Wait for 3 seconds to see if tuid becomes available
        setTimeout(() => {
          setIsWaitingForTuid(false);
          createChatMutation({
            business_id: businessID,
            location_coordinates: {
              latitude: location?.coords.latitude,
              longitude: location?.coords.longitude,
            },
            client_ip: clientIP || undefined,
            tuid: tuid || undefined, // Include tuid if available
          });
        }, 3000);
      } else {
        // If tuid is available or we're already waiting, proceed with mutation
        createChatMutation({
          business_id: businessID,
          location_coordinates: {
            latitude: location?.coords.latitude,
            longitude: location?.coords.longitude,
          },
          client_ip: clientIP || undefined,
          tuid: tuid || undefined, // Include tuid if available
        });
      }
    }
  };

  return (
    <div className={styles.createChat}>
      {/* First Half: Avatar & Title */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        className={classNames(styles.topSection, { [styles.show]: !isLoading })}
      >
        <Avatar
          variant="filled"
          radius="xl"
          size="xl"
          src={chatHead}
          name={chatHeadName}
          className={styles.avatarWithBorder}
        />
        <Title order={2}>{chatHeadName}</Title>
      </Flex>

      {/* Second Half: Start Talking Button */}
      <Flex
        direction="column"
        justify="center"
        align="center"
        className={classNames(styles.bottomSection, {
          [styles.show]: !isLoading,
        })}
      >
        <Button
          color={
            createChatMutationLoading || isWaitingForTuid
              ? ButtonColors.SECONDARY
              : error
              ? ButtonColors.DANGER
              : ButtonColors.INFO
          }
          onClick={handleButtonClick}
          disabled={createChatMutationLoading || !clientIP || isWaitingForTuid} // Disable button until IP is loaded or while waiting for tuid
        >
          <div
            className={classNames(styles.buttonText, {
              [styles.isLoading]: createChatMutationLoading || isWaitingForTuid,
            })}
          >
            {error
              ? "Retry"
              : isWaitingForTuid
              ? "Waiting for data..."
              : clientIP && !createChatMutationLoading && !isLoading
              ? "Start Talking!"
              : "Loading..."}
          </div>
        </Button>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}
      </Flex>

      {/* Powered By */}
      <div className={styles.poweredBy}>Powered by Kalp AI</div>
    </div>
  );
};

export default CreateChat;
