import { Request } from "express-serve-static-core";
import UserRepository from "@/repository/user.repository";
import BaseUsecasae from "@/api/BaseUsecase";
import { Response } from "express";
import { CustomRequest } from "@/types/interface";
import Joi from "joi";

/**
 * @openapi
 * /auth/user:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - User
 *     description: Fetch User List!
 *     parameters:
 *       - name: searchText
 *         in: query
 *         description: will be used to search by email
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *        200:
 *          description:  Fetch User List success!
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ProfileUserResponse'
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
export default class ListUserUsecase extends BaseUsecasae {
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
    const listUserSchema = Joi.object({
      query: Joi.object({
        searchText: Joi.string().optional(),
      }),
    });
    const { error } = listUserSchema.validate({ query: this.request.query });
    if (error) {
      throw createError(400, error.message);
    }
  }

  async execute() {
    try {
      this.validate();
      const searchText = this.request.query.searchText??''
      return await this.userRepository.findUsers({searchTerm:searchText.toString()});
    } catch (error) {
      throw error;
    }
  }

  static create(request: Request, response: Response) {
    let useCase = new ListUserUsecase(request, response, new UserRepository());
    return useCase;
  }
}
function createError(arg0: number, message: string) {
    throw new Error("Function not implemented.");
}

