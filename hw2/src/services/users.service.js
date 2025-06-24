import { Model } from "../models/model.js";

export class Service {
  static getUsers() {
    return Model.readUsers();
  }

  static createUser({ name, age, role }) {
    const users = Model.readUsers();

    const newUser = {
      id: `${Date.now()}`,
      name,
      age,
      role,
      profile: { profileId: `${Date.now() * 24}` }
    };

    const userList = [...users, newUser];

    Model.writeUsers(userList);

    return newUser;
  }

  static checkUser(userBody) {
    const users = Model.readUsers();

    return users.some((user) =>
      user.id === userBody.id
      || user.name === userBody.name
    );
  }

  static getUser(userBody) {
    const users = Model.readUsers();

    return users.find((user) => user.id === userBody.id);
  }

  static updateUser(userId, payload) {
    const users = Model.readUsers();

    const index = users.findIndex((user) => user.id === userId);

    const updatedUser = {
      ...users[index],
      name: payload.name || users[index].name,
      age: payload.age || users[index].age,
    };

    users[index] = updatedUser;

    Model.writeUsers(users);

    return updatedUser;
  }

  static changeUserRole(userId, newRole) {
    const users = Model.readUsers();

    const index = users.findIndex((user) => user.id === userId);

    users[index].role = newRole;

    Model.writeUsers(users);

    return users[index];
  }

  static deleteUser(userId) {
    const users = Model.readUsers();

    const index = users.findIndex((item) => item.id === userId);
    const deletedUser = users[index];

    const updatedUsers = [
      ...users.slice(0, index),
      ...users.slice(index + 1, users.length)
    ];

    Model.writeUsers(updatedUsers);

    return deletedUser;
  }
}
