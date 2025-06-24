import { parseBody } from "../../helpers/parse-body.js";
import { sendJSON } from "../../helpers/send-json.js";
import { generateError } from "../../helpers/generate-error.js";
import { PAYLOAD_ERROR, USER_EXISTS } from "../../helpers/error-msg.js";
import { Service } from "../../services/users.service.js";
import { generateResObj } from "../../helpers/generate-res-obj.js";

export default {
  GET(req, res) {
    const users = Service.getUsers();

    return sendJSON(res, generateResObj(users), 201);
  },
  POST(req, res) {
    return parseBody(req, ({ name, age, role }) => {
      if (!name || !age || !role) {
        return sendJSON(res, generateError(PAYLOAD_ERROR), 400);
      }

      const isUserExist = Service.checkUser({ name });

      if (isUserExist) {
        return sendJSON(res, generateError(USER_EXISTS), 400);
      }

      const newUser = Service.createUser({ name, age, role });

      return sendJSON(res, generateResObj(newUser), 201);
    });
  }
};
