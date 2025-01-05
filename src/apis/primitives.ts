import axios from 'axios';
import { AxiosResponse, AxiosError } from 'axios';
import { ErrorResponseType } from './responseTypes';

const BASE_URL = 'http://example.debatetimer.com/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export function makeUrl(endpoint: string): string {
  return BASE_URL + endpoint;
}

export async function request<T>(
  method: HttpMethod,
  endpoint: string,
  data: object | null,
  params: object | null,
): Promise<AxiosResponse<T>> {
  try {
    const response: AxiosResponse<T> = await axiosInstance({
      method,
      url: endpoint,
      data: data ? JSON.stringify(data) : null,
      params,
    });

    return response;
  } catch (error) {
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
