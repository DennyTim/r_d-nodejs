import Service from "../services/service.js";
import { addCommand } from "../router/router.js";

export const initController = () => {
  addCommand("add", Service.addHabits);
  addCommand("list", Service.getList);
  addCommand("update", Service.update);
  addCommand("delete", Service.delete);
  addCommand("done", Service.markDone);
  addCommand("stats", Service.getStats);
  addCommand("exit", () => {
    console.log("See you!");
    process.exit(0);
  });
};
