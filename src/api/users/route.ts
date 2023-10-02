import { Router, Request, Response, response } from "express";

import SignupUserUsecase from "./SignupUserUsecase";
import LoginUserUsecase from "./LoginUserUsecase";
import ProfileUserUsecase from "./ProfileUserUsecase";
import AddUserUsecase from "./AddUserUsecase";

import { auth, authAdmin } from "@/middleware/auth";
import UpdateUserUsecase from "./UpdateUserUsecase";
import ListUserUsecase from "./ListUserUsecase";

const usersRouter = Router();

usersRouter.post("/signup", async (request: Request, response: Response) => {
  const signupUserUsecase = SignupUserUsecase.create(request, response);
  await signupUserUsecase.executeAndHandleErrors();
});

usersRouter.post("/user", authAdmin(), async (request: Request, response: Response) => {
  const addUserUsecase = AddUserUsecase.create(request, response);
  await addUserUsecase.executeAndHandleErrors();
});

usersRouter.get("/user", auth(), async (request: Request, response: Response) => {
  const listUserUsecase = ListUserUsecase.create(request, response);
  await listUserUsecase.executeAndHandleErrors();
});

usersRouter.put("/user/:id", authAdmin(), async (request: Request, response: Response) => {
  const updateUserUsecase = UpdateUserUsecase.create(request, response);
  await updateUserUsecase.executeAndHandleErrors();
});

usersRouter.post("/login", async (request: Request, response: Response) => {
  const loginUserUsecase = LoginUserUsecase.create(request, response);
  await loginUserUsecase.executeAndHandleErrors();
});

usersRouter.get("/profile", auth(), async (req: Request, res: Response) => {
  const profileUserUsecase = ProfileUserUsecase.create(req, res);
  await profileUserUsecase.executeAndHandleErrors();
});

export default usersRouter;
