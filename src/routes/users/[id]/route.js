import { ID_ERROR, NOT_FOUND_ERROR, PATCH_ERROR, UPDATE_ERROR } from "../../../helpers/error-msg.js";
import { generateError } from "../../../helpers/generate-error.js";
import { sendJSON } from "../../../helpers/send-json.js";
import { parseBody } from "../../../helpers/parse-body.js";
import { Service } from "../../../services/users.service.js";
import { generateResObj } from "../../../helpers/generate-res-obj.js";

export default {
  GET(req, res) {
    const userId = req.params.id;

    return parseBody(req, () => {
      if (!userId) {
        return sendJSON(res, generateError(ID_ERROR), 400);
      }

      const user = Service.getUser({ id: userId });

      if (!user) {
        return sendJSON(res, generateError(NOT_FOUND_ERROR), 404);
      }

      return sendJSON(res, generateResObj(user), 200);
    });
  },
  PUT(req, res) {
    const userId = req.params.id;

    return parseBody(req, (body) => {
      if (!userId) {
        return sendJSON(res, generateError(ID_ERROR), 400);
      }

      const currentUser = Service.getUser({ id: userId });

      if (!currentUser) {
        return sendJSON(res, generateError(NOT_FOUND_ERROR), 404);
      }

      if (!body.age && !body.name) {
        return sendJSON(res, generateError(UPDATE_ERROR), 400);
      }

      const updatedUser = Service.updateUser(userId, body);

      return sendJSON(res, generateResObj(updatedUser), 200);
    });
  },
  PATCH(req, res) {
    const userId = req.params.id;

    return parseBody(req, (body) => {
      if (!userId) {
        return sendJSON(res, generateError(ID_ERROR), 400);
      }

      if (!body.role) {
        return sendJSON(res, generateError(PATCH_ERROR), 400);
      }

      const user = Service.getUser({ id: userId });

      if (!user) {
        return sendJSON(res, generateError(NOT_FOUND_ERROR), 404);
      }

      const updatedUser = Service.changeUserRole(userId, body.role);

      return sendJSON(res, generateResObj(updatedUser), 200);
    });
  },
  DELETE(req, res) {
    const userId = req.params.id;

    return parseBody(req, () => {
      if (!userId) {
        return sendJSON(res, generateError(ID_ERROR), 400);
      }

      const isUserExist = Service.checkUser({ id: userId });

      if (!isUserExist) {
        return sendJSON(res, generateError(NOT_FOUND_ERROR), 400);
      }

      const deletedUser = Service.deleteUser(userId);

      return sendJSON(res, generateResObj(deletedUser), 200);
    });
  }
};
