import axios from 'axios';
import { AxiosResponse } from 'axios';
import axiosInstance from './axiosInstance';

// HTTP request methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Define APIError; It only represents error that is returned from API response.
export class APIError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

// Low-level http request function
export async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data: object | null,
  params: object | null,
): Promise<AxiosResponse<T>> {
  const instance = axiosInstance;

  try {
    // Get response
    const response: AxiosResponse<T> = await instance({
      method,
      url: endpoint,
      data,
      params,
    });

    // If successful, return it
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // If error is raised during API request,
      // pass it as an APIError
      const responseData = error.response?.data;
      const message =
        typeof responseData === 'string'
          ? responseData
          : typeof responseData === 'object' && responseData !== null
            ? JSON.stringify(responseData)
            : error.message;
      const apiError = new APIError(
        message,
        error.response?.status || 500,
        responseData,
      );
      throw apiError;
    }

    // Else, just throw it
    throw error;
  }
}
