import dayjs from "dayjs";
import jwt from "jsonwebtoken";

import { tokenTypes } from "@/types/enums/token";
import User from "./models/user.model";
import config from "@/config/config";


const generateToken = (userId:number=0, expires:dayjs.Dayjs, type:tokenTypes, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: dayjs().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, `${secret}`);
};

export const generateAuthTokens = async (user:User) => {
  const accessTokenExpires = dayjs().add(60, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = dayjs().add(1, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};