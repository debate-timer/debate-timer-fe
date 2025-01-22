import axios from 'axios';
import { AxiosResponse, AxiosError } from 'axios';
import { ErrorResponseType } from './responseTypes';

// Base URL
// const BASE_URL = 'http://api.dev.debate-timer.com';

// Singleton Axios instance
const axiosInstance = axios.create({
  // baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// HTTP request methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Function that makes URLs that is going to be used to call APIs
export function makeUrl(endpoint: string): string {
  // return BASE_URL + endpoint;
  return '/api' + endpoint;
}

// Low-level http request function
export async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data: object | null,
  params: object | null,
): Promise<AxiosResponse<T>> {
  try {
    // Get response
    const response: AxiosResponse<T> = await axiosInstance({
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
        console.error('Error response data:', axiosError.response.data);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
