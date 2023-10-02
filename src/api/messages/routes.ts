import { Router, Request, Response } from "express";

import { auth } from "@/middleware/auth";

import CreateGroupUsecase from "./SendMessageToGroupUsecase";
import ListMessageOfGroupUsecase from "./ListMessageOfGroupUsecase";
import DeleteMessageFromGroupUsecase from "./DeleteMessageFromGroupUsecase";
import LikeMessageFromGroupUsecase from "./LikeMessageUsecase";
import GetLikeListOfMessageUsecase from "./GetLikeListOfMessageUsecase";
import RemoveLikeMessageUsecase from "./RemoveLikeMessageUsecase";

const messageRouter = Router();

messageRouter.post(
  "/",
  auth(),
  async (request: Request, response: Response) => {
    const createGroupUsecase = CreateGroupUsecase.create(request, response);
    await createGroupUsecase.executeAndHandleErrors();
  }
);

messageRouter.get(
  "/:groupId",
  auth(),
  async (request: Request, response: Response) => {
    const listMessageOfGroupUsecase = ListMessageOfGroupUsecase.create(
      request,
      response
    );
    await listMessageOfGroupUsecase.executeAndHandleErrors();
  }
);

messageRouter.delete(
  "/:id",
  auth(),
  async (request: Request, response: Response) => {
    const deleteMessageFromGroupUsecase = DeleteMessageFromGroupUsecase.create(
      request,
      response
    );
    await deleteMessageFromGroupUsecase.executeAndHandleErrors();
  }
);

messageRouter.post(
  "/:id/like-message",
  auth(),
  async (request: Request, response: Response) => {
    const likeMessageFromGroupUsecase = LikeMessageFromGroupUsecase.create(
      request,
      response
    );
    await likeMessageFromGroupUsecase.executeAndHandleErrors();
  }
);

messageRouter.delete(
  "/:id/like-message",
  auth(),
  async (request: Request, response: Response) => {
    const removeLikeMessageUsecase = RemoveLikeMessageUsecase.create(
      request,
      response
    );
    await removeLikeMessageUsecase.executeAndHandleErrors();
  }
);

messageRouter.get(
  "/:id/like-message",
  auth(),
  async (request: Request, response: Response) => {
    const getLikeListOfMessageUsecase = GetLikeListOfMessageUsecase.create(
      request,
      response
    );
    await getLikeListOfMessageUsecase.executeAndHandleErrors();
  }
);
export default messageRouter;
