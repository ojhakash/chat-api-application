import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";
import { CustomRequest } from "@/types/interface";

/**
 * @openapi
 * /group:
 *   post:
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
 *              name:
 *                type: string
 *                default: Demo Group
 *     responses:
 *        200:
 *          description: Create Group Success!
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
 *                    default: "\"body.name\" is required"
 *                  errors:
 *                    type: array
 *                    default: []
 */

export default class CreateUserUsecase extends BaseUsecasae {
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
        name: Joi.string().required(),
      }),
    });
    const { error } = createGroupSchema.validate({ body: this.request.body });
    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let name = this.request.body.name;
      let userId = (this.request as CustomRequest).user.id;
      let group = this.groupRepository.createGroup({ name }, userId ?? 0);
      return group;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new CreateUserUsecase(
      request,
      response,
      new GroupRepository()
    );
    return useCase;
  }
}
