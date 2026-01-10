import { useMutation, useQueryClient } from "react-query";
import { processBusinessDocs } from "../../../api/business";
import { BusinessQueryNames } from "../../../api/requests_responses/business";

export const useBusinessDocumentMutations = () => {
  const queryClient = useQueryClient();

  const processMutation = useMutation(
    (formData: FormData) => processBusinessDocs(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          BusinessQueryNames.GET_USER_BUSINESS_DETAILS,
        );
      },
    },
  );

  return {
    processMutation,
  };
};
