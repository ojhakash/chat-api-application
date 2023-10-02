import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import MessageRepository from "@/repository/message.repository";
import { CustomRequest } from "@/types/interface";
import GroupRepository from "@/repository/group.repository";

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Message management
 * components:
 *   schemas:
 *     ListItemMessageResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           default: 2
 *         text:
 *           type: string
 *           default: Demo text
 *         groupId:
 *           type: integer
 *           default: 1
 *         senderId:
 *           type: integer
 *           default: 1
 *         group:
 *           type: object
 *           properties:
 *              id:
 *                type: integer
 *                default: 1
 *              name:
 *                type: string
 *                default: 'my group'
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
 * /message/{groupId}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: groupId
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the group messages to fetch
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Message
 *     description: Fetch Message List!
 *     responses:
 *       200:
 *         description: Fetch Messages List Success
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ListItemMessageResponse'
 *
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   default: 400
 *                 message:
 *                   type: string
 *                   default: "This user is not part of the group"
 *                 errors:
 *                   type: array
 *                   default: []
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   default: "Please authenticate"
 */

export default class ListMessageOfGroupUsecase extends BaseUsecasae {
  messageRepository: MessageRepository;
  groupRepository: GroupRepository;

  constructor(
    request: Request,
    response: Response,
    messageRepository: MessageRepository,
    groupRepository: GroupRepository
  ) {
    super(request, response);
    this.messageRepository = messageRepository;
    this.groupRepository = groupRepository;
  }

  validate(): void {
    const listMessageSchema = Joi.object({
      params: {
        groupId: Joi.string().required(),
      },
    });

    const { error } = listMessageSchema.validate({
      params: this.request.params,
    });

    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let groupId = this.request.params.groupId;
      const userId = (this.request as CustomRequest).user.id;
      let userGroup = await this.groupRepository.getGroupByUserIdAndGroupId(
        userId ?? 0,
        +groupId
      );
      if (!userGroup) {
        throw createError(400, "This user is not part of the group");
      }
      let messages = this.messageRepository.listAllMessages(+groupId);
      return messages;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new ListMessageOfGroupUsecase(
      request,
      response,
      new MessageRepository(),
      new GroupRepository()
    );
    return useCase;
  }
}
