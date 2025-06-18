import { parseArgs } from "../helpers/parse-args.js";
import Model from "../models/model.js";

export default class Service {
  static addHabits(args) {
    const { name, freq } = parseArgs(args);
    Model.add(name, freq);
    console.log(`✅ New habit was added: "${name}" (${freq})`);
  }

  static getList() {
    const habits = Model.getAll();

    if (habits.length === 0) {
      console.log("No habits.");
      return;
    }

    console.log("Habits List:");
    console.table(habits);
  }

  static markDone(args) {
    const { id } = parseArgs(args);

    const result = Model.markDone(id);

    if (result.status === "failure") {
      console.log(`❌ Operation failed with error: ${result.message}`);
    } else {
      console.log(result.message);
    }
  }

  static update(args) {
    const { id, name, freq } = parseArgs(args);

    const result = Model.update(id, name, freq);

    if (result.status === "failure") {
      console.log(`❌ Operation failed with error: ${result.message}`);
    } else {
      console.log(result.message);
    }
  }

  static delete(args) {
    const { id } = parseArgs(args);

    const result = Model.delete(id);

    if (result.status === "failure") {
      console.log(`❌ Operation failed with error: ${result.message}`);
    } else {
      console.log(result.message);
    }
  }

  static getStats() {
    const now = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const percentFor = (timestamps, rangeDays) => {
      const recentDates = timestamps
        .map((date) => new Date(date).toISOString().split("T")[0])
        .filter((item) => {
          const then = new Date(item);
          const daysGone = Math.floor((now - then) / MS_PER_DAY);
          return daysGone < rangeDays;
        });

      const unique = new Set(recentDates);
      return `${unique.size}/${rangeDays} (${((unique.size / rangeDays) * 100).toFixed(1)}%)`;
    };

    const habits = Model.getAll();

    if (habits.length > 0) {
      habits.forEach((habit) => {
        const completions = habit.completionTimestamps || [];

        console.log(`=> ${habit.name}`);
        console.log(`Last 7 days:  ${percentFor(completions, 7)}`);
        console.log(`Last 30 days: ${percentFor(completions, 30)}`);
      });
    } else {
      console.log("No habits.");
    }
  }
}
