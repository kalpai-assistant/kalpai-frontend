/**
 * Fetches tracking user ID (tuid) from the specified API endpoint
 * @returns Promise with the tuid data or null if the request fails
 */
export const fetchTuid = async (): Promise<{
  tuid: string;
  upID: string;
} | null> => {
  try {
    const res = await fetch(
      "https://a.usbrowserspeed.com/cs?pid=3f6274bd78546e52bd181ff7e115b9515c2959f882a0f0fc2c1603e3fc9a0c9d",
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      },
    );
    const cType = res.headers.get("Content-Type") || "";
    if (cType.includes("application/json")) {
      return await res.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching tuid:", error);
    return null;
  }
};
