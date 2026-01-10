import { Amplify } from "aws-amplify";

export const cognitoConfig = {
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION || "us-east-1",
      identityPoolId: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID!,
      allowGuestAccess: true, // This enables unauthenticated access
    },
  },
};

// Initialize Amplify with Cognito configuration
export const initializeCognito = () => {
  if (!process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID) {
    throw new Error("REACT_APP_COGNITO_IDENTITY_POOL_ID is required");
  }

  try {
    Amplify.configure(cognitoConfig);
    console.log("Cognito configured successfully");
  } catch (error) {
    console.error("Failed to configure Cognito:", error);
  }
};

// Helper to check if Cognito is properly configured
export const isCognitoConfigured = (): boolean => {
  return !!process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID;
};
