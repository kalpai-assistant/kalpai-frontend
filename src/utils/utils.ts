import { TreeNodeData } from "@mantine/core";
import { setAuthorizationHeader, setHeaderEmail } from "../api/apiHelper";
import { GenerateTokenResponse } from "../api/requests_responses/business";
import { ExternalServiceURLs, UserLocalStorageTypes } from "./constants";

export const setLocalStorage = (
  data: { data: GenerateTokenResponse },
  typeUser: UserLocalStorageTypes = UserLocalStorageTypes.USER_DATA,
): void => {
  localStorage.setItem(typeUser, JSON.stringify(data.data));
  setAuthorizationHeader(data.data.token);
};

// set email in local storage
export const setLocalStorageHeaderEmail = (email: string): void => {
  localStorage.setItem(UserLocalStorageTypes.ADMIN_ACCESS_EMAIL, email);
  setHeaderEmail(email);
};

export const unsetLocalStorage = (
  typeUser: UserLocalStorageTypes = UserLocalStorageTypes.USER_DATA,
): void => {
  localStorage.removeItem(typeUser);
  setAuthorizationHeader(null);
};

export const getUserData = (
  firstCall: boolean = false,
  typeUser: UserLocalStorageTypes = UserLocalStorageTypes.USER_DATA,
): GenerateTokenResponse | null => {
  const data = localStorage.getItem(typeUser);
  if (!data) return null;
  const userData = JSON.parse(data);
  if (firstCall) setAuthorizationHeader(userData.token);
  return userData;
};

export const isTeamMember = (): boolean => {
  const userData = getUserData();
  return userData?.is_team_member === true;
};

export const getAdminAccessData = (): string | null => {
  return localStorage.getItem(UserLocalStorageTypes.ADMIN_ACCESS_EMAIL);
};

export const validateEmail = (email: string) => {
  // Updated email validation regex for proper format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length > 5 && emailRegex.test(email);
};

export const makeStringHumanReadable = (str: string): string => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const ipHelper = async (): Promise<string> => {
  const response = await fetch(`${ExternalServiceURLs.IPIFY}?format=json`);
  const { ip } = await response.json();
  return ip;
};

export const convertToTree = (
  obj: Record<string, unknown>,
  parentId = "root",
  ignoreKeys: string[] = ["business_type", "business_name", "description"],
): TreeNodeData[] => {
  return Object.entries(obj)
    .filter(([key]) => !ignoreKeys.includes(key)) // Ignore specified keys
    .map(([key, value], index) => {
      const nodeId = `${parentId}-${index}`;

      // Handle nested objects
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        return {
          label: makeStringHumanReadable(key),
          value: nodeId,
          children: convertToTree(
            value as Record<string, unknown>,
            nodeId,
            ignoreKeys,
          ),
        };
      }

      // Handle arrays
      if (Array.isArray(value)) {
        return {
          label: makeStringHumanReadable(key),
          value: nodeId,
          children: value.map((item, i) => {
            const childId = `${nodeId}-${i}`;

            if (typeof item === "object" && item !== null) {
              // Try to find a meaningful label from object properties
              const possibleKeys = ["name", "title", "label", "id"];
              const meaningfulLabel =
                possibleKeys.find((k) => k in item) &&
                String(
                  item[
                    possibleKeys.find((k) => k in item) as keyof typeof item
                  ],
                );

              return {
                label: meaningfulLabel
                  ? `${makeStringHumanReadable(key)}: ${meaningfulLabel}`
                  : `${makeStringHumanReadable(key)} #${i + 1}`, // Fallback
                value: childId,
                children: convertToTree(
                  item as Record<string, unknown>,
                  childId,
                  ignoreKeys,
                ),
              };
            }

            // Handle arrays of primitives (strings, numbers)
            return {
              label: `⚫️ ${String(item)}`,
              value: childId,
            };
          }),
        };
      }

      // Handle primitive values (booleans, numbers, strings)
      let formattedValue: string;
      if (typeof value === "boolean") {
        formattedValue = value ? "✅" : "❌"; // Display booleans better
      } else if (typeof value === "number") {
        formattedValue = `${value.toLocaleString()}`; // Format numbers
      } else {
        formattedValue = String(value);
      }

      return {
        label: `${makeStringHumanReadable(key)}: ${formattedValue}`,
        value: nodeId,
      };
    });
};
