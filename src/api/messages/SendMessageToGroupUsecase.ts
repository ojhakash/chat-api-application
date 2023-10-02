import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";
import { CustomRequest } from "@/types/interface";
import MessageRepository from "@/repository/message.repository";

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Message management
 * components:
 *   schemas:
 *     SendMessageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           default: 1
 *         text:
 *           type: string
 *           default: Demo Group
 *         groupId:
 *           type: interger
 *           default: 1
 *         senderId:
 *           type: integer
 *           default: 1
 *         isDeleted:
 *           type: boolean
 *           default: false
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
 * /message:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Message
 *     description: Send new message!
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              text:
 *                type: string
 *                default: Demo text
 *              groupId:
 *                type: number
 *                default: 1
 *     responses:
 *        200:
 *          description: Send message Success!
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/SendMessageResponse'
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
 *                    default: "This user is not part of the group"
 *                  errors:
 *                    type: array
 *                    default: []
 */

export default class SendMessageToGroupUsecase extends BaseUsecasae {
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
    const sendMessageToGroupSchema = Joi.object({
      body: Joi.object({
        text: Joi.string().required(),
        groupId: Joi.number().required(),
      }),
    });
    const { error } = sendMessageToGroupSchema.validate({
      body: this.request.body,
    });
    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let text = this.request.body.text;
      const userId = (this.request as CustomRequest).user.id;
      const groupId = this.request.body.groupId;
      let userGroup = await this.groupRepository.getGroupByUserIdAndGroupId(
        userId ?? 0,
        groupId
      );
      if (!userGroup) {
        throw createError(400, "This user is not part of the group");
      }
      const message = await this.messageRepository.createMessage(
        { text, groupId },
        userGroup.userId
      );
      return message;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new SendMessageToGroupUsecase(
      request,
      response,
      new GroupRepository(),
      new MessageRepository()
    );
    return useCase;
  }
}
