import { Avatar, Box, Loader } from "@mantine/core";
import React, { useRef, useState } from "react";
import TextInputWConfirm from "../../../utilComponents/TextInputWConfirm";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getUserBusiness,
  updateChatHeadName,
  updateChatHeadPic,
} from "../../../../api/business";
import { BusinessQueryNames } from "../../../../api/requests_responses/business";
import styles from "./BusinessProfile.module.scss";
import { Dropzone } from "@mantine/dropzone";
import { FaPlusCircle } from "react-icons/fa";

const BusinessProfile: React.FC = () => {
  const queryClient = useQueryClient();
  const [chatHead, setChatHead] = React.useState<string>("");
  const [profileURL, setProfileURL] = React.useState<string | undefined>(
    undefined,
  );
  const openRef = useRef<() => void>(null);
  const [isFileDragged, setIsFileDragged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: profileData, isLoading } = useQuery(
    BusinessQueryNames.GET_USER_BUSINESS,
    () => getUserBusiness(),
    {
      onSuccess: (data) => {
        setChatHead(data.data.chat_head_name);
        setProfileURL(data.data.chat_head_url);
      },
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: updateChatHead } = useMutation(
    BusinessQueryNames.UPDATE_CHAT_HEAD,
    () => updateChatHeadName(chatHead),
    {
      onSuccess: (data) => {
        if (data.data.ok)
          queryClient.invalidateQueries(BusinessQueryNames.GET_USER_BUSINESS);
      },
    },
  );

  const { mutate: updateChatPic } = useMutation(
    (formData: FormData) => updateChatHeadPic(formData), // Pass FormData to the API call
    {
      onSuccess: (data) => {
        if (data.data.ok) {
          queryClient.invalidateQueries(BusinessQueryNames.GET_USER_BUSINESS);
          setProfileURL(profileData?.data.chat_head_url);
        }
        setIsUploading(false);
        setIsFileDragged(false);
      },
    },
  );

  return (
    <Box className={styles.container}>
      {isLoading ? (
        <Loader />
      ) : (
        <Box className={styles.infoContainer}>
          <Box className={styles.dropzoneContainer}>
            <Dropzone
              openRef={openRef}
              className={styles.dropzone}
              accept={["image/jpeg", "image/png", "image/bmp", "image/svg+xml"]}
              onDrop={(files) => {
                const formData = new FormData();
                formData.append("file", files[0]); // Use "file" to match FastAPI parameter
                setIsUploading(true);
                updateChatPic(formData); // Call the mutation with the formData
              }}
              multiple={false}
              onDragEnter={() => setIsFileDragged(true)}
              onDragLeave={() => setIsFileDragged(false)}
              loading={isUploading}
              bg="#f4f4f4"
            >
              {isFileDragged || profileURL === undefined ? (
                <Avatar radius="xl" size="lg">
                  <FaPlusCircle />
                </Avatar>
              ) : (
                <Avatar
                  src={profileURL}
                  alt={profileData?.data.name}
                  radius="xs"
                  size="lg"
                />
              )}
            </Dropzone>
          </Box>
          <TextInputWConfirm
            value={chatHead}
            handleChange={setChatHead}
            onSubmit={() => updateChatHead()}
          />
        </Box>
      )}
    </Box>
  );
};

export default BusinessProfile;
