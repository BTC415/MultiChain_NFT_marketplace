import {
  VERSION,
  PROCESSED_SUCCESSFUL,
  RECORD_NOT_FOUND,
  UPDATED_SUCCESS,
  INSERTED_SUCCESS,
  DELETED_SUCCESS,
} from "../constants";
import { HTTP_STATUS_CODE } from "../constants/httpStatusCode";

const RESPONSE_MESSAGE_FOR_HTTP_METHOD = {
  GET: PROCESSED_SUCCESSFUL,
  POST: INSERTED_SUCCESS,
  DELETE: DELETED_SUCCESS,
  PATCH: UPDATED_SUCCESS,
};

export const getFormattedResponse = (response: any, httpMethod: string) => ({
  version: VERSION.VERSION1,
  status: HTTP_STATUS_CODE.OK,
  message: !!response ? RESPONSE_MESSAGE_FOR_HTTP_METHOD[httpMethod] : RECORD_NOT_FOUND,
  data: response,
});
