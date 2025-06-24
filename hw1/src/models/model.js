import * as fs from "node:fs";
import { FILE } from "../config/config.js";
import { generateId } from "../helpers/generate-id.js";
import { now } from "../helpers/now.js";

export default class Model {
  static allowedFreq = ["daily", "weekly", "monthly"];

  static readDb() {
    const payload = fs.readFileSync(FILE, "utf-8");

    return JSON.parse(payload);
  }

  static writeDb(habits) {
    fs.writeFileSync(FILE, JSON.stringify(habits));
  }

  static getAll() {
    return this.readDb();
  }

  static add(name, freq) {
    if (!name || !freq) {
      return {
        data: null,
        message: "Please specify --name and --freq <daily|weekly|monthly>",
        status: "failure"
      };
    }

    if (!this.allowedFreq.includes(freq)) {
      return {
        data: null,
        message: `❌ Incorrect argument. Please use one of next values for --freq key: ${this.allowedFreq.join(", ")}`,
        status: "failure"
      };
    }

    let habitsList = this.readDb();

    if (!Array.isArray(habitsList)) {
      habitsList = [];
    }

    const newHabit = {
      id: generateId(),
      name,
      freq,
      completionTimestamps: []
    };

    habitsList.push(newHabit);

    this.writeDb(habitsList);

    return newHabit;
  }

  static markDone(id) {
    if (!id) {
      return {
        data: null,
        message: "No id for habit",
        status: "failure"
      };
    }

    const numericId = Number(id);

    if (isNaN(numericId)) {
      return {
        data: null,
        message: "Incorrect habit id",
        status: "failure"
      };
    }

    const habitsList = this.readDb();

    const habit = habitsList.find(item => item.id === numericId);

    if (!habit) {
      return {
        data: null,
        message: "Habit isn't found",
        status: "failure"
      };
    }

    if (!habit.completionTimestamps) {
      return {
        data: null,
        message: "Habit isn't created",
        status: "failure"
      };
    }

    if (!Array.isArray(habit.completionTimestamps)) {
      return {
        data: null,
        message: "Habit instance is broken",
        status: "failure"
      };
    }

    habit.completionTimestamps = [
      ...habit.completionTimestamps,
      now()
    ];

    this.writeDb(habitsList);

    return {
      data: habit,
      message: `✅ Habit (id: ${habit.id}) is done`,
      status: "success"
    };
  }

  static update(id, name, freq) {
    if (!id) {
      return {
        data: null,
        message: "No id for habit",
        status: "failure"
      };
    }

    if (!this.allowedFreq.includes(freq)) {
      return {
        data: null,
        message: `❌ Incorrect argument. Please use one of next values for --freq key: ${this.allowedFreq.join(", ")}`,
        status: "failure"
      };
    }

    const numericId = Number(id);

    if (isNaN(numericId)) {
      return {
        data: null,
        message: "Incorrect habit id",
        status: "failure"
      };
    }

    if (!name || !freq) {
      return {
        data: null,
        message: "Please specify --name or --freq <daily|weekly|monthly>",
        status: "failure"
      };
    }

    const habitsList = this.readDb();

    let habitIndex = habitsList.findIndex(item => item.id === numericId);

    if (habitIndex < 0) {
      return {
        data: null,
        message: "Habit isn't found",
        status: "failure"
      };
    }

    const habit = habitsList[habitIndex];

    habitsList[habitIndex] = { ...habit, name, freq };

    this.writeDb(habitsList);

    return {
      data: habit,
      message: `✅ Habit (id: ${habit.id}) is updated`,
      status: "success"
    };
  }

  static delete(id) {
    if (!id) {
      return {
        data: null,
        message: "No id for habit",
        status: "failure"
      };
    }

    const numericId = Number(id);

    if (isNaN(numericId)) {
      return {
        data: null,
        message: "Incorrect habit id",
        status: "failure"
      };
    }

    let habitsList = this.readDb();
    let habitIndex = habitsList.findIndex(item => item.id === numericId);

    if (habitIndex < 0) {
      return {
        data: null,
        message: "Habit isn't found",
        status: "failure"
      };
    }

    habitsList.splice(habitIndex, 1);

    this.writeDb(habitsList);

    return {
      data: null,
      message: `✅ Habit (id: ${id}) is removed`,
      status: "success"
    };
  }
}
