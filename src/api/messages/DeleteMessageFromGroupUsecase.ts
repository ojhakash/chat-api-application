import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";
import MessageRepository from "@/repository/message.repository";
import { CustomRequest } from "@/types/interface";

/**
 * @openapi
 * /message/{id}:
 *   delete:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the message to delete
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Message
 *     description: Delete message info!
 *     responses:
 *        200:
 *          description: Delete message Success!
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    default: true
 *        401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    default: "Please authenticate"
 *        400:
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  code:
 *                    type: integer
 *                    default: 400
 *                  message:
 *                    type: string
 *                    default: "The message id provided is invalid."
 *                  errors:
 *                    type: array
 *                    default: []
 */

export default class DeleteMessageFromGroupUsecase extends BaseUsecasae {
  groupRepository: GroupRepository;
  messageRepository: MessageRepository;

  constructor(
    request: Request,
    response: Response,
    groupRepository: GroupRepository,
    messageRepository: MessageRepository
  ) {
    super(request, response);
    this.groupRepository = groupRepository;
    this.messageRepository = messageRepository;
  }

  validate(): void {
    const deleteMessageFromGroupSchema = Joi.object({
      params: {
        id: Joi.string().required(),
      },
    });

    const { error } = deleteMessageFromGroupSchema.validate({
      params: this.request.params,
    });

    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let messageId = this.request.params.id;
      const userId = (this.request as CustomRequest).user.id;
      let messageDeletedCount = await this.messageRepository.deleteMessage(
        +messageId,
        userId ?? 0
      );
      if (!messageDeletedCount) {
        throw createError(400, "The message id provided is invalid.");
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new DeleteMessageFromGroupUsecase(
      request,
      response,
      new GroupRepository(),
      new MessageRepository()
    );
    return useCase;
  }
}
