import { Avatar, Box, Flex, Loader, Text } from "@mantine/core";
import { useQuery } from "react-query";
import { useState, useEffect } from "react";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import ChatIntroImageManager from "./manager/ChatIntroImageManager";
import { getChatIntroImages, IntroQueryNames } from "../../../../api/intro";
import { ChatIntroImageResponse } from "../../../../api/requests_responses/intro";
import { FaImage } from "react-icons/fa";
import { IconArrowRight } from "@tabler/icons-react";
import styles from "./ChatIntroImage.module.scss";

const ChatIntroImage: React.FC = () => {
  const DEFAULT_MAX_IMAGES = 6;

  const { width } = useViewportSize();
  const [maxImages, setMaxImages] = useState(DEFAULT_MAX_IMAGES);
  const [opened, { open, close }] = useDisclosure(false);
  const [chatIntroImages, setChatIntroImages] = useState<
    ChatIntroImageResponse[]
  >([]);

  // Calculate how many images can fit based on viewport width
  useEffect(() => {
    if (width) {
      if (width > 750) setMaxImages(3 + Math.floor((width - 750) / 150));
      else setMaxImages(DEFAULT_MAX_IMAGES);
    }
  }, [width]);

  const { isLoading } = useQuery(
    [IntroQueryNames.GET_CHAT_INTRO_IMAGES],
    () => getChatIntroImages(),
    {
      onSuccess: (data) => {
        setChatIntroImages(data.data);
      },
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      <Flex direction="column" gap="sm" className={styles.chatIntroImage}>
        {/* <Flex justify="flex-end" mt="-1rem">
          <Anchor size="sm" underline="always" c="gray" onClick={open}>
            Edit
          </Anchor>
        </Flex> */}
        {isLoading ? (
          <Loader />
        ) : chatIntroImages.length === 0 ? (
          <Box className={styles.emptyState} onClick={open}>
            <Flex direction="row" align="center" gap="sm" justify="center">
              <FaImage size={24} color="#666" />
              <Text size="sm" c="dimmed">
                Add Some Intro Images
              </Text>
              <IconArrowRight size={20} color="#228be6" />
            </Flex>
          </Box>
        ) : (
          <Box style={{ cursor: "pointer" }} onClick={open}>
            <Avatar.Group>
              {chatIntroImages.slice(0, maxImages).map((item) => (
                <Avatar
                  key={item.id}
                  variant="filled"
                  radius="sm"
                  src={item.image_url}
                  size="xl"
                />
              ))}
              {chatIntroImages.length > maxImages && (
                <Avatar variant="outline" radius="sm" size="xl">
                  +{chatIntroImages.length - maxImages}
                </Avatar>
              )}
            </Avatar.Group>
          </Box>
        )}
      </Flex>
      <ChatIntroImageManager
        introImages={chatIntroImages}
        opened={opened}
        onClose={close}
      />
    </>
  );
};

export default ChatIntroImage;
