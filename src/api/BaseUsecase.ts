import { Request, Response } from "express";
import { ValidationError } from "sequelize";

export default class BaseUsecaser {
  request: Request;
  response: Response;
  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
  }

  async execute(): Promise<JSON | null | void | object> {}

  async executeAndHandleErrors(
  ) {
    try {
      let data = await this.execute();
      if (data == null) {
        data = {};
      }

      this.response.status(200).json(data);
    } catch (error: any) {
      if (error != null) {
        let message = error.message;

        let code = error.code ? error.code : 400;
        let data: {
          code: number;
          message: string;
          errors: { type: string | null; message: string }[];
        } = { code: code, message: message, errors: [] };

        if (error instanceof ValidationError) {
          for (const err of error.errors) {
            data.errors.push({ type: err.path, message: err.message });
          }
        }
        this.response.status(code >= 100 && code < 600 ? code : 500).json(data);
      } else {
        let data = {
          code: 400,
          message: "Unable to process your request, please try again",
        };
        this.response.status(400).json(data);
      }
    }
  }

  validate() {}
}
