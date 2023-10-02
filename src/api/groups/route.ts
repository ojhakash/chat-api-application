import { Router, Request, Response } from "express";

import { auth } from "@/middleware/auth";

import CreateGroupUsecase from "./CreateGroupUsecase";
import ListGroupsOfUserUsecase from "./ListGroupsOfUserUsecase";
import ListGroupUsecase from "./ListGroupUsecase";
import GetGroupUsecase from "./GetGroupUsecase";
import AddUserToGroupUsecase from "./AddUserToGroupUsecase";
import RemoveUserFromGroupUsecase from "./RemoveUserFromGroupUsecase";
import DeleteGroupUsecase from "./DeleteGroupUsecase";

const groupRouter = Router();

groupRouter.post("/", auth(), async (request: Request, response: Response) => {
  const createGroupUsecase = CreateGroupUsecase.create(request, response);
  await createGroupUsecase.executeAndHandleErrors();
});

groupRouter.get("/", auth(), async (request: Request, response: Response) => {
  const listGroupUsecase = ListGroupUsecase.create(request, response);
  await listGroupUsecase.executeAndHandleErrors();
});

groupRouter.get("/me", auth(), async (request: Request, response: Response) => {
  const listGroupsOfUserUsecase = ListGroupsOfUserUsecase.create(
    request,
    response
  );
  await listGroupsOfUserUsecase.executeAndHandleErrors();
});

groupRouter.get(
  "/:id",
  auth(),
  async (request: Request, response: Response) => {
    const getGroupUsecase = GetGroupUsecase.create(request, response);
    await getGroupUsecase.executeAndHandleErrors();
  }
);

groupRouter.delete(
  "/:id",
  auth(),
  async (request: Request, response: Response) => {
    const deleteGroupUsecase = DeleteGroupUsecase.create(request, response);
    await deleteGroupUsecase.executeAndHandleErrors();
  }
);

groupRouter.post(
  "/:id/add-user",
  auth(),
  async (request: Request, response: Response) => {
    const addUserToGroupUsecase = AddUserToGroupUsecase.create(
      request,
      response
    );
    await addUserToGroupUsecase.executeAndHandleErrors();
  }
);

groupRouter.post(
  "/:id/remove-user",
  auth(),
  async (request: Request, response: Response) => {
    const removeUserFromGroupUsecase = RemoveUserFromGroupUsecase.create(
      request,
      response
    );
    await removeUserFromGroupUsecase.executeAndHandleErrors();
  }
);

export default groupRouter;
