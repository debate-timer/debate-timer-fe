import axios from 'axios';
import { AxiosResponse, AxiosError } from 'axios';
import { ErrorResponseType } from './responses/global';
import axiosInstance from './axiosInstance';

// HTTP request methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

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
      data: data ? JSON.stringify(data) : null,
      params,
    });

    return response;
  } catch (error) {
    // Handle error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponseType>;
      console.error('Error message:', axiosError.message);
      if (axiosError.response) {
        console.error('Error response data:', axiosError.response.data.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
