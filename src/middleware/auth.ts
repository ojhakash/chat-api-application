import createError from "http-errors";
import passport from "passport";
import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import User from "@/models/user.model";
import { UserType } from "@/types/enums/token";

const verifyCallback =
  (
    req: Request,
    resolve: { (value?: any): void },
    reject: { (reason?: any): void }
  ) =>
  async (err: any, user: User, info: any) => {
    if (err || info || !user) {
      return reject(
        createError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }
    req.user = user;
    resolve(user);
  };

export const auth =
  () => async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => res.status(httpStatus.UNAUTHORIZED).send(err));
  };

const verifyCallbackAdmin =
  (
    req: Request,
    resolve: { (value?: any): void },
    reject: { (reason?: any): void }
  ) =>
  async (err: any, user: User, info: any) => {
    if (err || info || !user) {
      return reject(
        createError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }
    if (user.role !== UserType.ADMIN) {
      return reject(
        createError(
          httpStatus.UNAUTHORIZED,
          "Only admin can perform this operation."
        )
      );
    }
    req.user = user;
    resolve(user);
  };

export const authAdmin =
  () => async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallbackAdmin(req, resolve, reject)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => res.status(httpStatus.UNAUTHORIZED).send(err));
  };
