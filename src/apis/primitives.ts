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
      method: method,
      url: endpoint,
      data: data,
      params: params,
    });

    // If successful, return it
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // If error is raised during API request,
      // pass it as an APIError
      const apiError = new APIError(
        error.response?.data || error.message,
        error.response?.status || 500,
        error.response?.data,
      );
      throw apiError;
    }

    // Else, just throw it
    throw error;
  }
}
