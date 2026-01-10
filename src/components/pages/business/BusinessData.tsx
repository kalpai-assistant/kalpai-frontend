import { useForm } from "@mantine/form";
import {
  TextInput,
  Box,
  Tree,
  Group,
  Button,
  useTree,
  Paper,
  Flex,
} from "@mantine/core";

import styles from "./BusinessData.module.scss";

import { ActionIcon } from "@mantine/core";
import { FaInfoCircle } from "react-icons/fa";
import { GenericModal } from "../../utilComponents/Modal";
import RegenerateBusinessContext from "./RegenerateBusinessContext";
import {
  getUserBusinessDetails,
  updateBusinessDetails,
} from "../../../api/business";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  BusinessQueryNames,
  BusinessUpdateNameTypeRequest,
  StandardResponse,
  UserBusinessDetailsResponse,
} from "../../../api/requests_responses/business";
import { useEffect, useState } from "react";
import { isEqual } from "lodash";
import { convertToTree } from "../../../utils/utils";
import { IconChevronRight } from "@tabler/icons-react";
import { AxiosResponse } from "axios";
import TextInputWConfirm from "../../utilComponents/TextInputWConfirm";
import BusinessDocs from "./BusinessDocs";

const InfoModal = () => (
  <GenericModal
    displayOnlyIcon
    buttonDisplayIcon={
      <ActionIcon size="lg" variant="filled">
        <FaInfoCircle size={20} />
      </ActionIcon>
    }
  >
    <div>
      <p>🌟 This data was lovingly crafted by AI to enhance your experience.</p>
      <p>🌟 If you need any changes, try regenerating the data</p>
    </div>
  </GenericModal>
);

interface BusinessDataProps {
  businessData?: Record<string, unknown>;
  businessId?: number;
  atLogin?: boolean;
}

const BusinessData = ({
  businessData = {},
  businessId,
  atLogin = false,
}: BusinessDataProps) => {
  const queryClient = useQueryClient();
  const [userBusiness, setUserBusiness] = useState<
    UserBusinessDetailsResponse | undefined
  >();
  const [localBusinessID, setLocalBusinessID] = useState<number | undefined>(
    businessId,
  );
  const tree = useTree();

  const { isLoading: userBusinessLoading } = useQuery(
    BusinessQueryNames.GET_USER_BUSINESS_DETAILS,
    () => getUserBusinessDetails(),
    {
      enabled:
        businessId === undefined && Object.keys(businessData).length === 0, // Disable query if businessId is provided
      onSuccess: (data) => {
        setUserBusiness(data.data);
        setLocalBusinessID(data.data.business_id);
      },
      refetchOnWindowFocus: false,
      refetchInterval: (data) => {
        // If context_processing_semaphore is non-zero, poll every 5 seconds
        // Stop polling after 12 calls (1 minute) or when semaphore becomes 0
        const semaphore = data?.data?.context_processing_semaphore;
        if (semaphore && semaphore !== 0) {
          return 5000; // 5 seconds
        }
        return false; // Stop polling
      },
      refetchIntervalInBackground: true,
    },
  );

  const { mutate: updateBusinessMutation } = useMutation({
    mutationFn: (data: BusinessUpdateNameTypeRequest) =>
      updateBusinessDetails(data),
    onSuccess: (data: AxiosResponse<StandardResponse>) => {
      if (data.data.ok) {
        queryClient.invalidateQueries(
          BusinessQueryNames.GET_USER_BUSINESS_DETAILS,
        );
      }
    },
    onError: (error) => {
      console.error("Error updating business details:", error);
    },
  });

  const form = useForm({
    initialValues: businessId !== undefined ? businessData : userBusiness, // Use businessData directly if businessId is provided
  });

  const [previousValues, setPreviousValues] = useState<
    UserBusinessDetailsResponse | undefined
  >();

  // Update form values only when userBusiness or businessData changes meaningfully
  useEffect(() => {
    if (businessId !== undefined) return; // Skip updates if businessId is provided

    const newValues = userBusiness;
    if (
      !userBusinessLoading &&
      !isEqual(previousValues, newValues) // Only update if values have changed
    ) {
      form.setValues(newValues || {});
      setPreviousValues(newValues); // Track the last set values
    }
  }, [userBusiness, userBusinessLoading, previousValues, form, businessId]);

  return (
    <Box>
      <Box className={styles.icons}>
        <InfoModal />
        <RegenerateBusinessContext
          description={form.values.description as string}
          atLogin={atLogin}
          businessId={localBusinessID}
        />
      </Box>

      <BusinessDocs
        documents={userBusiness?.business_docs || []}
        isLoading={userBusinessLoading}
        isPastProcessing={userBusiness?.context_processing_semaphore !== 0}
      />

      {atLogin ? (
        <Flex>
          <TextInput
            value={form.values.name as string}
            styles={{ input: { fontWeight: "bold" } }}
          />
          <TextInput
            label="Business Category"
            value={form.values.business_type as string}
            styles={{ input: { fontWeight: "bold" } }}
          />
        </Flex>
      ) : (
        <Flex gap="md" direction="column">
          <TextInputWConfirm
            value={form.values.name as string}
            handleChange={(value) => form.setFieldValue("name", value)}
            onSubmit={() =>
              updateBusinessMutation({ name: form.values.name as string })
            }
          />
          <TextInputWConfirm
            label="Business Category"
            value={form.values.business_type as string}
            handleChange={(value) => form.setFieldValue("business_type", value)}
            onSubmit={() =>
              updateBusinessMutation({
                business_type: form.values.business_type as string,
              })
            }
          />
        </Flex>
      )}

      <Group mt="md">
        <Button variant="light" onClick={() => tree.expandAllNodes()}>
          View Full
        </Button>
        <Button variant="outline" onClick={() => tree.collapseAllNodes()}>
          View Collapsed
        </Button>
      </Group>
      <Tree
        tree={tree}
        data={convertToTree(form.values as Record<string, unknown>)}
        levelOffset={23}
        renderNode={({ node, expanded, hasChildren, elementProps }) => (
          <Group gap={5} {...elementProps}>
            {hasChildren && (
              <IconChevronRight
                size={18}
                style={{
                  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            )}

            <Paper shadow="xs" p={4} pr={12} m={4}>
              {node.label}
            </Paper>
          </Group>
        )}
      />
      {/* <Box mt="lg">
        {Object.entries(form.values).map(([key, value]) =>
          key === "business_type" || key === "business_name" ? null : (
            <BusinessFieldRenderer
              key={key}
              keyName={key}
              value={value}
              form={form}
              path={[]}
            />
          ),
        )}
      </Box> */}
    </Box>
  );
};

export default BusinessData;
