import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";


/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group management
 * components:
 *   schemas:
 *     UserGroupCreationInvalid:
 *      type: object
 *      properties:
 *        code:
 *          type: integer
 *          default: 400
 *        message:
 *          type: message
 *          default: "Validation error: groupId and userId combination must be unique."
 *        errors:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              type:
 *                type: string
 *                default: 'userId'
 *              message:
 *                type: string
 *                default: "groupId and userId combination must be unique."
 *               
 *
 */

/**
 * @openapi
 * /group/{id}/add-user:
 *   post:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the group
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Group
 *     description: Create new Group!
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: number
 *                default: 1
 *     responses:
 *       200:
 *         description: Add user to group Success
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGroupCreationInvalid'
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

export default class AddUserToGroupUsecase extends BaseUsecasae {
  groupRepository: GroupRepository;

  constructor(
    request: Request,
    response: Response,
    groupRepository: GroupRepository
  ) {
    super(request, response);
    this.groupRepository = groupRepository;
  }

  validate(): void {
    const createGroupSchema = Joi.object({
      body: Joi.object({
        userId: Joi.number().required(),
      }),
      params: {
        id: Joi.string().required(),
      },
    });
    const { error } = createGroupSchema.validate({ body: this.request.body, params: this.request.params });
    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      const userId = this.request.body.userId
      const groupId = +this.request.params.id
      const group = this.groupRepository.addUserToGroup(groupId, userId);
      return group;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new AddUserToGroupUsecase(
      request,
      response,
      new GroupRepository()
    );
    return useCase;
  }
}
