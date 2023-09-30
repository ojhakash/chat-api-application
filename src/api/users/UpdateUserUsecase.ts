import { Request } from "express-serve-static-core";
import UserRepository from "@/repository/user.repository";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import createError from "http-errors";
import Joi from "joi";
import { UserType } from "@/types/enums/token";

/**
 * @openapi
 * /auth/user/{userId}:
 *   put:
 *     parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *        schema:
 *          type: integer
 *        description: Numeric ID of the user to get
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - User
 *     description: Update User!
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SignupUserPayload'
 *     responses:
 *       200:
 *         description: Update User Success
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

export default class UpdateUserUsecase extends BaseUsecasae {
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
    const updateUserSchema = Joi.object({
      body: Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password: Joi.string()
          .min(8)
          .max(30)
          .pattern(new RegExp("^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>?]).*$"))
          .required()
          // .message('Password should contain atleast one special character on number and one integer'),
      }),
      params: {
        id: Joi.string().required(),
      },
    });
    const { error } = updateUserSchema.validate({
      body: this.request.body,
      params: this.request.params,
    });

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
      let user = await this.userRepository.updateUser(this.request.params.id, {
        username: username,
        email: email,
        password: password,
        role: UserType.STANDARD,
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new UpdateUserUsecase(
      request,
      response,
      new UserRepository()
    );
    return useCase;
  }
}
