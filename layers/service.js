import Model from "./model.js";

class Service {
  static readUsers() {
    const { users } = Model.readUsers();

    return {
      data: users,
      time: new Date().toISOString()
    };
  }

  static addUser(newUser) {
    const { users } = Model.readUsers();
    const userList = [...users, newUser];
    Model.writeUsers({ users: userList });
  }

  static updateUser(userId, payload) {
    const { users } = Model.readUsers();

    const index = users.findIndex((item) => item.id === userId);

    const updatedUser = {
      ...users[index],
      age: payload.age || users[index].age,
      role: payload.role || users[index].role
    };

    users[index] = updatedUser;

    Model.writeUsers({ users: users });

    return updatedUser;
  }

  static deleteUser(userId) {
    const { users } = Model.readUsers();

    const index = users.findIndex((item) => item.id === userId);
    const deletedUser = users[index];
    const updatedUsers = [
      ...users.slice(0, index),
      ...users.slice(index + 1, users.length)
    ];

    Model.writeUsers({ users: updatedUsers });
    return deletedUser;
  }

  static checkUser(user) {
    const { data } = Service.readUsers();

    return data.some((item) =>
      item.id === user.id || item.name === user?.name
    );
  }

  static createUser({ name, age, role }) {
    return { id: `${Date.now()}`, name, age, role };
  }

  static generateError(msg) {
    return {
      data: null,
      error: msg,
      time: new Date().toISOString()
    };
  }
}

export default Service;
