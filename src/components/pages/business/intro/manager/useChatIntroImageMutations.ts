import { useMutation, useQueryClient } from "react-query";
import {
  addChatIntroImage,
  deleteChatIntroImage,
  updateChatIntroImageDescription,
  IntroQueryNames,
} from "../../../../../api/intro";

export const useChatIntroImageMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation(
    (formData: FormData) => addChatIntroImage(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([IntroQueryNames.GET_CHAT_INTRO_IMAGES]);
      },
    },
  );

  const deleteMutation = useMutation(deleteChatIntroImage, {
    onSuccess: () => {
      queryClient.invalidateQueries([IntroQueryNames.GET_CHAT_INTRO_IMAGES]);
    },
  });

  const updateMutation = useMutation(
    ({ id, description }: { id: number; description: string }) =>
      updateChatIntroImageDescription(id, description),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([IntroQueryNames.GET_CHAT_INTRO_IMAGES]);
      },
    },
  );

  return {
    addMutation,
    deleteMutation,
    updateMutation,
  };
};
