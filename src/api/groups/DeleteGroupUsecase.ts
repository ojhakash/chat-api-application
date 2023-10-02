import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";

/**
 * @openapi
 * /group/{id}:
 *   delete:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the group to delete
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Group
 *     description: Delete group info!
 *     responses:
 *        200:
 *          description: Delete Group Success!
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
 *          description: Unauthorized
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
 *                    default: "The groupId provided is invalid."
 *                  errors:
 *                    type: array
 *                    default: []
 */

export default class DeleteGroupUsecase extends BaseUsecasae {
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
    const getGroupSchema = Joi.object({
      params: {
        id: Joi.string().required(),
      },
    });

    const { error } = getGroupSchema.validate({
      params: this.request.params,
    });

    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let groupId = this.request.params.id;
      let groupUpdatedCount = await this.groupRepository.markInActiveGroupById(
        +groupId
      );
      if (!groupUpdatedCount) {
        throw createError(400, "No active group exists with the given id");
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new DeleteGroupUsecase(
      request,
      response,
      new GroupRepository()
    );
    return useCase;
  }
}
