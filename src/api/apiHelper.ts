import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { SERVER_URL } from "../config";

axios.defaults.baseURL = SERVER_URL;
axios.defaults.headers.post["Content-Type"] = "application/json";

// Define types for axios error handling and interceptors
type AxiosError = {
  status?: number;
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
};

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error: AxiosError) {
    let message;
    // Safely access navigate from the APIClient instance
    const _navigate = apiClient.navigate;
    switch (error.status) {
      case 500:
        message = "Internal Server Error";
        break;
      case 401:
        message = "Invalid credentials";
        if (error.response?.data?.detail === "Token has expired") {
          const previousPath =
            window.location.pathname + window.location.search;
          if (_navigate) {
            _navigate("/login", {
              state: { expired: true, redirectAfterLogin: previousPath },
            });
          } else {
            console.warn(
              "Navigate function not set. Ensure setNavigate is called before making API requests.",
            );
          }
        }
        break;
      case 403:
        message = "Not Authenticated";
        if (error.response?.data?.detail === "Not authenticated") {
          // this.navigate("/jumpin");
        }
        break;
      case 404:
        message = "Sorry! The data you are looking for could not be found";
        break;
      default:
        message = error.response?.data?.detail || error.message || error;
    }

    message = error.response?.data?.detail || error.message || error || message;
    return Promise.reject(message);
  },
);

const setAuthorizationHeader = (authToken: string | null) => {
  console.log("Setting authorization header...");
  if (authToken) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + authToken;
  }
};

const setHeaderEmail = (email: string) => {
  console.log("Setting Admin email header...");
  if (email) {
    axios.defaults.headers.common["Email"] = email;
  }
};

const clearHeaderEmail = () => {
  console.log("Clearing email header...");
  delete axios.defaults.headers.common["Email"];
};

class APIClient {
  controller: AbortController | undefined;
  navigate: any; // Define type for navigate function if needed

  constructor() {
    this.controller = undefined;
    this.navigate = undefined;
  }

  setNavigate = (navigateFunction: any) => {
    this.navigate = navigateFunction;
  };

  get = async <T>(
    url: string,
    params?: AxiosRequestConfig["params"],
  ): Promise<AxiosResponse<T>> => {
    this.controller = new AbortController();

    try {
      const response = await axios.get<T>(url, {
        params,
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  post = async <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    this.controller = new AbortController();

    try {
      const response = await axios.post<T>(url, data, {
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  postWithParams = async <T>(
    url: string,
    params: AxiosRequestConfig["params"],
    data?: any,
  ): Promise<AxiosResponse<T>> => {
    this.controller = new AbortController();

    try {
      const response = await axios.post<T>(url, data, {
        params,
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  postForFiles = async <T>(
    url: string,
    data: FormData,
  ): Promise<AxiosResponse<T>> => {
    this.controller = new AbortController();

    try {
      const response = await axios.post<T>(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  update = async <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    try {
      const response = await axios.patch<T>(url, data, {
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  put = async <T>(url: string, data?: any): Promise<AxiosResponse<T>> => {
    try {
      const response = await axios.put<T>(url, data, {
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  putForFiles = async <T>(
    url: string,
    data: FormData,
  ): Promise<AxiosResponse<T>> => {
    this.controller = new AbortController();

    try {
      const response = await axios.put<T>(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  delete = async <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    try {
      const response = await axios.delete<T>(url, {
        ...config,
        signal: this.controller?.signal,
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  cancel = () => {
    if (this.controller) {
      this.controller.abort();
    }
  };
}
const apiClient = new APIClient();

export { apiClient, setAuthorizationHeader, setHeaderEmail, clearHeaderEmail };
