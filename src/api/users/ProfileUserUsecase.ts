import { Request } from "express-serve-static-core";
import UserRepository from "@/repository/user.repository";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import { CustomRequest } from "@/types/interface";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *   schemas:
 *     ProfileUserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           default: 1
 *         username:
 *           type: string
 *           default: akash_ojha
 *         email:
 *           type: string
 *           default: akashojha@gmail.com
 *         role:
 *           type: string
 *           enum:
 *            - admin
 *            - standard
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
 * /auth/profile:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - User
 *     description: Login User!
 *     responses:
 *        200:
 *          description: Login User Success!
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ProfileUserResponse'
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
export default class ProfileUserUsecase extends BaseUsecasae {
  userRepository: UserRepository;

  constructor(
    request: Request,
    response: Response,
    userRepository: UserRepository
  ) {
    super(request, response);
    this.userRepository = userRepository;
  }

  validate(): void {

  }

  async execute() {
    try {
      this.validate(); 
      let userId = (this.request as CustomRequest).user.id
      return await this.userRepository.findUserById(userId)
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new ProfileUserUsecase(request, response, new UserRepository());
    return useCase;
  }
}