import * as router from "../helpers/router.js";
import Service from "./service.js";
import { parseBody, sendJSON } from "../helpers/transformers.js";
import { ErrorMessage } from "../helpers/errors.js";

export const initRoutes = () => {
  router.addRoute("GET", "/users", (req, res) => {
    const data = Service.readUsers();
    return sendJSON(res, data);
  });

  router.addRoute("POST", "/users", (req, res) => {
    return parseBody(req, body => {
      if (!body?.name || !body?.age || !body?.role) {
        return sendJSON(res, Service.generateError(ErrorMessage.incorrectPayload), 400);
      }

      const newUser = Service.createUser(body);
      const isUserExist = Service.checkUser(newUser);

      if (isUserExist) {
        return sendJSON(res, Service.generateError(ErrorMessage.userExists), 400);
      }

      Service.addUser(newUser);
      sendJSON(res, newUser, 201);
    });
  });

  router.addRoute("PUT", "/users/:id", (req, res) => {
    const userId = req.params.id;

    return parseBody(req, body => {
      if (!userId) {
        return sendJSON(res, Service.generateError(ErrorMessage.incorrectId), 400);
      }

      if (body.name) {
        return sendJSON(res, Service.generateError(ErrorMessage.nameNotUpdated), 400);
      }

      const isUserExist = Service.checkUser({ id: userId });

      if (!isUserExist) {
        return sendJSON(res, Service.generateError(ErrorMessage.userNotFound), 404);
      }

      if (!body.age && !body.role) {
        return sendJSON(res, Service.generateError(ErrorMessage.nothingToUpdate), 400);
      }

      const updatedUser = Service.updateUser(userId, body);

      sendJSON(res, updatedUser, 200);
    });
  });

  router.addRoute("DELETE", "/users/:id", (req, res) => {
    const userId = req.params.id;

    return parseBody(req, () => {
      if (!userId) {
        return sendJSON(res, Service.generateError(ErrorMessage.incorrectId), 400);
      }

      const isUserExist = Service.checkUser({ id: userId });

      if (!isUserExist) {
        return sendJSON(res, Service.generateError(ErrorMessage.userNotFound), 404);
      }

      const deleteUser = Service.deleteUser(userId);

      sendJSON(res, deleteUser, 200);
    });
  });
};
