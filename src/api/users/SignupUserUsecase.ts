import { Request } from "express-serve-static-core";
import UserRepository from "@/repository/user.repository";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import { UserType } from "@/types/enums/token";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 * components:
 *   schemas:
 *     SignupUserPayload:
 *       type: object
 *       required:
 *        - email
 *        - password
 *        - username
 *       properties:
 *         username:
 *           type: string
 *           default: akashojha
 *         email:
 *           type: string
 *           default: akashojha@gmail.com
 *         password:
 *           type: string
 *           default: "Secret@12345678"
 *     SignupInvalidData:
 *      type: object
 *      properties:
 *        code:
 *          type: integer
 *          default: 400
 *        message:
 *          type: message
 *          default: 'Validation error'
 *        errors:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              type:
 *                type: string
 *                default: 'username'
 *              message:
 *                type: string
 *                default: "username must be unique"
 *               
 *
 */

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags:
 *      - User
 *     description: Signup User!
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SignupUserPayload'
 *     responses:
 *       200:
 *         description: Signup User Success
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ProfileUserResponse'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupInvalidData'
 */

export default class SignupUserUsecase extends BaseUsecasae {
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
    const signupSchema = Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(8)
          .max(30)
          .pattern(new RegExp("^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>?]).*$"))
          .required(),
        // .message('Password should contain atleast one special character on number and one integer'),
        username: Joi.string().required(),
      }),
    });
    const { error } = signupSchema.validate({ body: this.request.body });

    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      let username = this.request.body.username;
      let password = this.request.body.password;
      let email = this.request.body.email;
      let user = this.userRepository.createUser({
        username: username,
        email: email,
        password: password,
        role: UserType.ADMIN,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new SignupUserUsecase(
      request,
      response,
      new UserRepository()
    );
    return useCase;
  }
}
