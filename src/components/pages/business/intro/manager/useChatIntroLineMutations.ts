import { useMutation } from "react-query";
import { AxiosResponse } from "axios";
import { StandardResponse } from "../../../../../api/requests_responses/business";
import {
  addChatIntroLine,
  deleteChatIntroLine,
  selectChatIntroLine,
  updateChatntroLine,
} from "../../../../../api/intro";

const useChatIntroLineMutations = (refetchLines: () => void) => {
  const { mutate: updateIntroLine, isLoading: isUpdateLoading } = useMutation(
    (params: { id: number; message: string }) =>
      updateChatntroLine({ intro_line_id: params.id, message: params.message }),
    {
      onSuccess: (data: AxiosResponse<StandardResponse>) => {
        if (data.data.ok) refetchLines();
      },
    },
  );

  const { mutate: addIntroLine, isLoading: isAddLoading } = useMutation({
    mutationFn: (message: string) => addChatIntroLine({ message }),
    onSuccess: (data: AxiosResponse<StandardResponse>) => {
      if (data.data.ok) refetchLines();
    },
  });

  const { mutate: deleteIntroLine, isLoading: isDeleteLoading } = useMutation({
    mutationFn: (id: number) => deleteChatIntroLine(id),
    onSuccess: (data: AxiosResponse<StandardResponse>) => {
      if (data.data.ok) refetchLines();
    },
  });

  const { mutate: selectIntroLine, isLoading: isSelectLoading } = useMutation({
    mutationFn: (id: number) => selectChatIntroLine(id),
    onSuccess: (data: AxiosResponse<StandardResponse>) => {
      if (data.data.ok) refetchLines();
    },
  });

  return {
    updateIntroLine,
    addIntroLine,
    deleteIntroLine,
    selectIntroLine,
    isLoading:
      isUpdateLoading || isAddLoading || isDeleteLoading || isSelectLoading,
  };
};

export default useChatIntroLineMutations;
