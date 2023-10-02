import { Request } from "express-serve-static-core";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import GroupRepository from "@/repository/group.repository";
import { CustomRequest } from "@/types/interface";


/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group management
 * components:
 *   schemas:
 *     ListItemGroupResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           default: 1
 *         name:
 *           GroupName: string
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
 * /group/me:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Group
 *     description: Fetch my Groups List!
 *     responses:
 *       200:
 *         description: Fetch Groups List Success
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ListItemGroupResponse'
 *                  
 *       400:
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

  validate(): void {}

  async execute() {
    try {
      this.validate();
      let userId = (this.request as CustomRequest).user.id;
      let groups = this.groupRepository.getGroupsByUseId(userId ?? 0);
      return groups;
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
