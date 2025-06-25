const store = new Map();

class Model {
  static get(key) {
    return store.get(key);
  }

  static has(key) {
    return store.has(key);
  }

  static set(key, value) {
    return store.set(key, value);
  }
}

export default Model;
