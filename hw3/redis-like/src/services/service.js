import Model from "../model/model.js";

class Service {
  static get(key) {
    return Model.get(key);
  }

  static has(key) {
    return Model.has(key);
  }

  static set(key, value) {
    return Model.set(key, value);
  }
}

export default Service;
