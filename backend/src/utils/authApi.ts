import jwt from "jsonwebtoken";

import { SUB_STATUS_CODE } from "../constants/httpStatusCode";
import config from "../../config";
import { UNAUTHORIZED } from "../constants";

export default class AuthApi {
  public static authRequest = async (authorizationToken: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        if (authorizationToken == "myAuthToken") {
          resolve({ success: true });
        } else {
          reject({
            subStatusCd: SUB_STATUS_CODE.ER_401_01,
            error: UNAUTHORIZED,
          });
        }
      } catch (err) {
        reject({ subStatusCd: SUB_STATUS_CODE.ER_401_01, error: UNAUTHORIZED });
      }
    });
  };

  public static decodeToken = async (authToken: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        let decoded = await jwt.verify(authToken.trim(), config.ENCRYPTION_KEY.trim());
        if (decoded) {
          resolve(decoded);
        } else {
          reject(false);
        }
      } catch (err) {
        reject(err);
      }
    });
  };
}
