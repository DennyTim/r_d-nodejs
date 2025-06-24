import * as fs from "node:fs";
import * as path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FILE = path.join(__dirname, "..", "db", "database.json");

export class Model {
  static readUsers() {
    const payload = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(payload);
  }

  static writeUsers(users) {
    fs.writeFileSync(FILE, JSON.stringify(users));
  }
}
