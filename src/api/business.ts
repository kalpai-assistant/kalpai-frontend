// api.ts
import { AxiosResponse } from "axios";
import {
  BusinessChatIntegrationScript,
  BusinessChatLinkPath,
  BusinessListResponse,
  BusinessOnboardRequest,
  BusinessOnboardResponse,
  BusinessOverviewStats,
  BusinessUpdateNameTypeRequest,
  BusinessUpdateRequest,
  GenerateTokenResponse,
  RegenerateBusinessRequest,
  StandardResponse,
  UserBusinessDetailsResponse,
  UserBusinessResponse,
  VerifyOTPRequest,
} from "./requests_responses/business";
import { apiClient } from "./apiHelper";

// Business Onboarding
export const onboardBusiness = async (
  request: BusinessOnboardRequest,
): Promise<AxiosResponse<BusinessOnboardResponse>> => {
  return apiClient.post<BusinessOnboardResponse>("/business/", request);
};

// Business Data regenerate with description prop
export const regenerateBusinessData = async (
  request: RegenerateBusinessRequest,
): Promise<AxiosResponse<StandardResponse>> => {
  const endpoint = request.atLogin
    ? "/business/regenerate/at-login"
    : "/business/regenerate";
  return apiClient.post<StandardResponse>(endpoint, request);
};

// Business Update
export const updateBusiness = async (
  request: BusinessUpdateRequest,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>("/business/", request);
};

// Generate OTP Token
export const generateToken = async (
  email: string,
): Promise<AxiosResponse<GenerateTokenResponse>> => {
  return apiClient.post<GenerateTokenResponse>(
    `/business/generate-otp/${email}`,
  );
};

// Verify OTP
export const verifyOtp = async (
  request: VerifyOTPRequest,
): Promise<AxiosResponse<GenerateTokenResponse>> => {
  return apiClient.post<GenerateTokenResponse>("/business/verify-otp", request);
};

// Admin Business List
export const adminBusinessList = async (
  searchString: string,
): Promise<AxiosResponse<BusinessListResponse>> => {
  return apiClient.get<BusinessListResponse>(
    `/business/admin?search_string=${searchString}`,
  );
};

// Get User Business Response Details
export const getUserBusinessDetails = async (): Promise<
  AxiosResponse<UserBusinessDetailsResponse>
> => {
  return apiClient.get<UserBusinessDetailsResponse>("/business/details");
};

// Get User Business Response
export const getUserBusiness = async (): Promise<
  AxiosResponse<UserBusinessResponse>
> => {
  return apiClient.get<UserBusinessResponse>("/business");
};

// Update Chat Head Name
export const updateChatHeadName = async (
  chatHeadName: string,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>(`/business/update-chat-name`, {
    chat_head_name: chatHeadName,
  });
};

// Update Chat Head Name
export const updateChatHeadPic = async (
  formData: FormData, // Use FormData instead of a string
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.postForFiles<StandardResponse>(
    `/business/upload-avatar`,
    formData,
  );
};

// Quick Stats
export const businessQuickStats = async (
  sourceType?: string,
): Promise<AxiosResponse<BusinessOverviewStats>> => {
  const params = sourceType ? { source_type: sourceType } : {};
  return apiClient.get<BusinessOverviewStats>(
    "/business/overview-stats",
    params,
  );
};

export const businessChatLinkPath = async (): Promise<
  AxiosResponse<BusinessChatLinkPath>
> => {
  return apiClient.get<BusinessChatLinkPath>("/business/chat-link");
};

export const businessChatIntegrationScript = async (): Promise<
  AxiosResponse<BusinessChatIntegrationScript>
> => {
  return apiClient.get<BusinessChatIntegrationScript>(
    "/business/chat-integration",
  );
};

export const updateBusinessDetails = async (
  request: BusinessUpdateNameTypeRequest,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>("/business/update/", request);
};

// Business Documents
export const processBusinessDocs = async (
  formData: FormData,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.postForFiles<StandardResponse>(
    "/business/process-business-docs",
    formData,
  );
};
