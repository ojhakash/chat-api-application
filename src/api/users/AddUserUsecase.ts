import { Request } from "express-serve-static-core";
import UserRepository from "@/repository/user.repository";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import { UserType } from "@/types/enums/token";


/**
 * @openapi
 * /auth/user:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - User
 *     description: Create new User!
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SignupUserPayload'
 *     responses:
 *       200:
 *         description: Create User Success
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

export default class AddUserUsecase extends BaseUsecasae {
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
        role: UserType.STANDARD,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new AddUserUsecase(request, response, new UserRepository());
    return useCase;
  }
}
