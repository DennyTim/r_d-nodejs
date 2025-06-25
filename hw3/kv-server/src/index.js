import express from "express";
import { getValue, setValue } from "./controller/controller.js";

const app = express();
app.use(express.json());

app.get("/kv/:key", getValue);
app.post("/kv", setValue);

app.listen(
  process.env.PORT,
  () => console.log(`KV Server started on port ${process.env.PORT}`)
);
