import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { TextInput, Textarea, Button, Title } from "@mantine/core";
import {
  BusinessOnboardResponse,
  StandardResponse,
} from "../../../api/requests_responses/business";
import { AxiosResponse } from "axios";
import { useMutation } from "react-query";
import { onboardBusiness, updateBusiness } from "../../../api/business";
import { useState } from "react";
import { PuffLoader } from "react-spinners";

import styles from "./BusinessRegister.module.scss";
import PostBusinessRegister from "./PostBusinessRegister";
import { NavigateFromTo } from "../../../utils/constants";
import { FaArrowLeft } from "react-icons/fa";
import { validateEmail } from "../../../utils/utils";

const BusinessRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailPrefill = location.state?.email || "";
  const [showError, setShowError] = useState("");
  const [businessData, setBusinessData] = useState<
    Record<string, unknown> | undefined
  >(undefined);
  const [businessID, setBusinessID] = useState<number>(0);

  const form = useForm({
    initialValues: {
      name: "",
      business_type: "",
      description: "",
      email: emailPrefill,
    },

    validate: {
      name: (value: string) => (value ? null : "Business Name is required"),
      business_type: (value: string) =>
        value ? null : "Business Type is required",
      description: (value: string) =>
        value ? null : "Description is required",
      email: (value: string) =>
        validateEmail(value) ? null : "Please enter a valid email",
    },
  });

  const { mutate: BusinessOnboardMutation, isLoading: isOnboardLoading } =
    useMutation({
      mutationFn: onboardBusiness,
      onSuccess: (data: AxiosResponse<BusinessOnboardResponse>) => {
        if (data.data.business_id) {
          setBusinessData(data.data.business_data);
          setBusinessID(data.data.business_id);
        } else {
          setShowError("An unexpected error occurred.");
        }
      },
      onError: (error: any) => {
        setShowError(
          error?.response?.data?.detail ||
            error?.message ||
            error ||
            "An unexpected error occurred.",
        );
      },
    });

  const {
    mutate: BusinessCompleteOnboardMutation,
    isLoading: isCompleteOnboardLoading,
  } = useMutation({
    mutationFn: updateBusiness,
    onSuccess: (data: AxiosResponse<StandardResponse>) => {
      if (data.data.ok) {
        navigate("/login", {
          state: {
            email: form.values.email,
            from: NavigateFromTo.POST_REGISTER__LOGIN,
          },
        });
      } else {
        setShowError("An unexpected error occurred.");
      }
    },
    onError: (error: any) => {
      setShowError(
        error?.response?.data?.detail ||
          error?.message ||
          error ||
          "An unexpected error occurred.",
      );
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    BusinessOnboardMutation(values);
  };

  const handleCompleteOnboard = () => {
    if (!businessData) {
      return;
    }
    BusinessCompleteOnboardMutation({
      business_id: businessID,
      context: businessData,
    });
  };

  return (
    <>
      <div className={styles.formContainer}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <div className={styles.topBar}>
            <FaArrowLeft
              onClick={() => navigate("/login")}
              className={styles.leftIcon}
            />
            <Title order={3} className={styles.title}>
              Let's Get Started!
            </Title>
          </div>
          <TextInput
            label="Business Name"
            placeholder="Enter your business name"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Business Type"
            placeholder="Enter your business type"
            {...form.getInputProps("business_type")}
          />
          <Textarea
            label="Description"
            placeholder="Enter your business description"
            {...form.getInputProps("description")}
            rows={8}
          />
          <TextInput
            label="Email"
            placeholder="Enter your email"
            {...form.getInputProps("email")}
          />
          <Button variant="outline" type="submit" loading={isOnboardLoading}>
            {isOnboardLoading ? (
              <PuffLoader color="white" size={20} />
            ) : (
              "Proceed"
            )}
          </Button>
        </form>
        {showError && <div className={styles.error}>{showError}</div>}
      </div>
      {businessData && (
        <PostBusinessRegister
          businessData={businessData}
          onSubmit={handleCompleteOnboard}
          isLoading={isCompleteOnboardLoading}
          businessID={businessID}
        />
      )}
    </>
  );
};

export default BusinessRegister;
