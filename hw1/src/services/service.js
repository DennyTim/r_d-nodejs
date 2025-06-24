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
    const percentFor = (timestamps, rangeDays, freq) => {
      const now = new Date();
      const MS_PER_DAY = 1000 * 60 * 60 * 24;

      const recentDates = timestamps
        .map(ts => new Date(ts))
        .filter(date => {
          const daysAgo = Math.floor((now - date) / MS_PER_DAY);
          return daysAgo < rangeDays;
        });

      const countedSet = new Set();

      for (const date of recentDates) {
        if (freq === "daily") {
          countedSet.add(date.toISOString().split("T")[0]);
        } else if (freq === "weekly") {
          countedSet.add(getWeekKey(date));
        } else if (freq === "monthly") {
          countedSet.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
        }
      }

      const completed = countedSet.size;
      let denominator;

      if (freq === "daily") {
        denominator = rangeDays;
      } else if (freq === "weekly") {
        denominator = Math.ceil(rangeDays / 7);
      } else if (freq === "monthly") {
        denominator = Math.ceil(rangeDays / 30);
      } else {
        return "Invalid frequency";
      }

      const percent = (completed / denominator) * 100;
      return `${completed}/${denominator} (${percent.toFixed(1)}%)`;
    };

    const getWeekKey = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const week1 = new Date(d.getFullYear(), 0, 4);
      const weekNumber = Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7 + 1);
      return `${d.getFullYear()}-W${weekNumber}`;
    };

    const habits = Model.getAll();

    if (habits.length > 0) {
      habits.forEach((habit) => {
        const completions = habit.completionTimestamps || [];
        const freq = habit.freq || "daily";

        console.log(`=> ${habit.name}`);
        console.log(`Last 7 days:  ${percentFor(completions, 7, freq)}`);
        console.log(`Last 30 days: ${percentFor(completions, 30, freq)}`);
      });
    } else {
      console.log("No habits.");
    }
  }
}
