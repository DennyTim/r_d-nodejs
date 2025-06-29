import { nanoid } from "nanoid";

export class BrewModel {
  static scope = "singleton";
  #store = new Map();

  constructor() {
  }

  all(method, ratingMin) {
    let brewList = [...this.#store.values()];

    if (method) {
      brewList = brewList.filter(item => item.method === method);
    }

    if (ratingMin) {
      brewList = brewList.filter(item => item.rating >= ratingMin);
      brewList.sort((a, b) => a.rating > b.rating ? 1 : -1);
    }

    return [...brewList];
  }

  findById(id) {
    return this.#store.get(id) ?? null;
  }

  create(dto) {
    const id = nanoid(8);
    const brew = { id, ...dto };
    this.#store.set(id, brew);
    return brew;
  }

  update(id, dto) {
    if (!this.#store.has(id)) {
      return null;
    }

    const brew = { id, ...dto };
    this.#store.set(id, brew);
    return brew;
  }

  remove(id) {
    return this.#store.delete(id);
  }
}
