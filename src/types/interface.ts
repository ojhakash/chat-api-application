import User from "@/models/user.model";
import { Request } from "express";

export interface CustomRequest extends Request {
  user: User;
}
