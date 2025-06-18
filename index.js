import readline from "readline";
import { retrieveArgs } from "./src/helpers/retrieve-args.js";
import { handleCommand } from "./src/router/router.js";
import { initController } from "./src/controllers/controller.js";

initController();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "$ "
});

console.log("> Please enter command (add, list, done, update, delete, stats, exit)");
rl.prompt();

rl
  .on("line", (line) => {
    const argList = retrieveArgs(line.trim());
    const [command, ...args] = argList;
    handleCommand(command, args);

    console.log("> Please enter command (add, list, done, update, delete, stats, exit)");
    rl.prompt();
  })
  .on("close", () => {
    console.log("👋 See you!");

    process.exit(0);
  });

