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
 *     GroupResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           default: 1
 *         name:
 *           type: string
 *           default: Demo Group
 *         isActive:
 *           type: boolean
 *           default: true
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
 * /group/{id}:
 *   get:
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the group to get
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Group
 *     description: Get group info!
 *     responses:
 *        200:
 *          description: Get Group Success!
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/GroupResponse'
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

export default class GetGroupUsecase extends BaseUsecasae {
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
      let group = await this.groupRepository.findGroupById(+groupId);
      if(!group){
        throw createError(400, 'The groupId provided is invalid.');
      }

      let users = await this.groupRepository.getUsersByGroupId(+groupId);
      return { ...group?.toJSON(), users };
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new GetGroupUsecase(request, response, new GroupRepository());
    return useCase;
  }
}
