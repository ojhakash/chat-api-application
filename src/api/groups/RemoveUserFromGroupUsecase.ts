import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";

/**
 * @openapi
 * /group/{id}/remove-user:
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
 *     description: Remove user from group
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
 *          description: Remove user from group Success
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    default: true
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   default: "No active group exists with the given groupId and userId"
 */

export default class RemoveUserFromGroupUsecase extends BaseUsecasae {
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
    const { error } = createGroupSchema.validate({
      body: this.request.body,
      params: this.request.params,
    });
    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      const userId = this.request.body.userId;
      const groupId = +this.request.params.id;
      const userGroupDeletedCount =
        await this.groupRepository.removeUserFromGroup(groupId, userId);
      if (!userGroupDeletedCount) {
        throw createError(
          400,
          "No active group exists with the given groupId and userId"
        );
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new RemoveUserFromGroupUsecase(
      request,
      response,
      new GroupRepository()
    );
    return useCase;
  }
}
