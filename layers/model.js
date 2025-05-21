import fs from "fs";
import { FILE } from "../config/config.js";

class Model {
  static readUsers() {
    const payload = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(payload);
  }

  static writeUsers(users) {
    fs.writeFileSync(FILE, JSON.stringify(users));
  }
}

export default Model;
