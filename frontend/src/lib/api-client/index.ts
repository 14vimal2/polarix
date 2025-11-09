/* tslint:disable */
/* eslint-disable */
export * from './runtime';
export * from './apis/index';
export * from './models/index';

import { UserApi } from "./apis/UserApi";
import { apiConfig } from "./config";

export const userApi = new UserApi(apiConfig);
