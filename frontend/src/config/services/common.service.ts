import axios, {
  AxiosResponse,
  AxiosError,
  AxiosPromise,
  Method
} from "axios";

import setHeader from "../utils/setHeader";

type AxiosReturn = Promise<AxiosPromise<AxiosResponse | AxiosError>>;

interface ServiceParams {
  method: Method;
  route: string;
  headerCred?: {
    autherization?: string;
    contentType?: string;
  };
  data?: object | string;
}

export default async ({
  method,
  route,
  headerCred,
  data,
}: ServiceParams): Promise<AxiosPromise<AxiosResponse | AxiosError>> => {
  const headers = setHeader(headerCred) as any;

  const response: AxiosResponse = await axios({
    method,
    url: route,
    headers,
    data,
  });
  if (response.data?.data) {
    return response.data.data;
  }
  return response.data;
};
