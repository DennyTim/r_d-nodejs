import { parseBody } from "../../../../helpers/parse-body.js";
import { sendJSON } from "../../../../helpers/send-json.js";
import { generateError } from "../../../../helpers/generate-error.js";
import { ID_ERROR, NOT_FOUND_ERROR } from "../../../../helpers/error-msg.js";
import { Service } from "../../../../services/users.service.js";
import { generateResObj } from "../../../../helpers/generate-res-obj.js";

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

      return sendJSON(res, generateResObj({ profile: user.profile }), 200);
    });
  }
};
