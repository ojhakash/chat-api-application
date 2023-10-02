import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";
import MessageRepository from "@/repository/message.repository";
import { CustomRequest } from "@/types/interface";

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Message management
 * components:
 *   schemas:
 *     ListItemLikeMessageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           default: 2
 *         messageId:
 *           type: integer
 *           default: 1
 *         userId:
 *           type: integer
 *           default: 1
 *         user:
 *           type: object
 *           properties:
 *              id:
 *                type: integer
 *                default: 1
 *              username:
 *                type: string
 *                default: 'akashojha@gmail.com'
 *              email:
 *                type: string
 *                default: 'akashojha@gmail.com'
 *              role:
 *                type: string
 *                default: 'admin'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date and time
 *           example: "2024-01-30T08:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Creation date and time
 *           example: "2024-01-30T08:30:00Z"
 *
 */

/**
 * @openapi
 * /message/{id}/like-message:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the message to like
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Message
 *     description: Get Message Likes info!
 *     responses:
 *        200:
 *          description: Get message likes info Success!
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ListItemLikeMessageResponse'
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
 */

export default class GetLikeListOfMessageUsecase extends BaseUsecasae {
  messageRepository: MessageRepository;

  constructor(
    request: Request,
    response: Response,
    messageRepository: MessageRepository
  ) {
    super(request, response);
    this.messageRepository = messageRepository;
  }

  validate(): void {
    const getLikeListOfMessageSchema = Joi.object({
      params: {
        id: Joi.string().required(),
      },
    });

    const { error } = getLikeListOfMessageSchema.validate({
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
      let messageLikes = await this.messageRepository.getLikesInfoForMessage(+messageId);
      return messageLikes;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new GetLikeListOfMessageUsecase(
      request,
      response,
      new MessageRepository()
    );
    return useCase;
  }
}
