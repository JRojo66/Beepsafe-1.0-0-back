import { ERROR_TYPE } from "./EErrors.js";

export class CustomError{
    static createError(name="Error", cause, message, code = ERROR_TYPE.INTERNAL_SERVER_ERROR){
          const error = new Error(message, {cause: cause})
          error.name = name;
          error.code = code;

          throw error
    }
}
