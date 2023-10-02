import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import passport from "passport";
import cors from "cors";

import usersRouter from "@/api/users/route";
import groupRouter from "@/api/groups/route";
import messageRouter from '@/api/messages/routes';
import { jwtStrategy } from "@/config/passport";
import swaggerDocs from "@/swagger";

dotenv.config();

const app: Express = express();

app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(bodyParser.json({ limit: "10mb" }));

// enable cors
app.use(cors());
app.options("*", cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use("/auth", usersRouter);
app.use("/group", groupRouter);
app.use("/message", messageRouter)
swaggerDocs(app)
app.use("*", (req: Request, res: Response) => {
  res.status(404).send({ message: "Not valid routes" });
});

export default app;
