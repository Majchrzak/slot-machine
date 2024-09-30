import envVar from "env-var";
import dotenv from "dotenv";

dotenv.config();

import { app } from "./app";

const port: number = envVar.get("APP_PORT").default("8080").asInt();

app.listen(port, () => {
  console.info(`API server started on port ${port}`);
});
