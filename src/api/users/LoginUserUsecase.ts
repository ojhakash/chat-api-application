import { Request } from "express-serve-static-core";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";

import UserRepository from "@/repository/user.repository";
import BaseUsecasae from "@/api/BaseUsecase";
import { generateAuthTokens } from "@/utils";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 * components:
 *   schemas:
 *      LoginUserPayload:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            default: akashojha@gmail.com
 *          password:
 *            type: string
 *            default: "Secret@12345678"
 *      LoginSuccessReponse:
 *        type: object
 *        properties:
 *          user: 
 *            $ref: '#/components/schemas/ProfileUserResponse'
 *          tokens:
 *            type: object
 *            properties:
 *              access:
 *                type: object
 *                properties:
 *                  token: 
 *                    type: string
 *                    default: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY5NjA1NTQzMywiZXhwIjoxNjk2MDU5MDMzLCJ0eXBlIjoiYWNjZXNzIn0.2psi6Mid2GE1Y2rDr-Yn20n0SsB7mQebYQHNzvJVZqE"
 *                  expires:
 *                    type: string
 *                    format: date-time
 *                    example: "2024-01-30T08:30:00Z"
 *              refresh:
 *                type: object
 *                properties:
 *                  token: 
 *                    type: string
 *                    default: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY5NjA1NTQzMywiZXhwIjoxNjk2MTQxODMzLCJ0eXBlIjoicmVmcmVzaCJ9.ckmSx_NYOATk7xf9uFK9bfP-dm28TnJMRB-B2aHi40g"
 *                  expires:
 *                    type: string
 *                    format: date-time
 *                    example: "2024-01-30T08:30:00Z"
 *      LoginInvalidData:
 *        type: object
 *        properties:
 *          code:
 *            type: integer
 *            default: 400
 *          message:
 *            type: message
 *            default: "Invalid credentials"
 *          errors:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                type:
 *                  type: string
 *                message:
 *                  type: string
 *        
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *      - User
 *     description: Login User!
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginUserPayload'
 *     responses:
 *       200:
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginSuccessReponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginInvalidData'
 */
export default class LoginUserUsecase extends BaseUsecasae {
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
    const loginSchema = Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(8)
          .max(30)
          .pattern(new RegExp("^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>?]).*$"))
          .required()
          // .message('Password should contain atleast one special character on number and one integer'),
      }),
    });
    const { error } = loginSchema.validate({ body: this.request.body });

    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let password = this.request.body.password;
      let email = this.request.body.email;
      let user = await this.userRepository.loginUser({
        email: email,
        password: password,
      });

      const tokens = await generateAuthTokens(user);
      return { user, tokens };
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new LoginUserUsecase(request, response, new UserRepository());
    return useCase;
  }
}
