import fs from "node:fs/promises";
import { databasePath } from "../database.js";
export async function verifyTaskInDB(id) {
  let dbLookUp = await fs.readFile(databasePath, "utf-8").then((data) => {
    data = JSON.parse(data);
    return data["Tasks"]?.find((t) => t.id === id);
  });
  if (dbLookUp) {
    dbLookUp = { ...dbLookUp, update_at: new Date() };
  }
  return dbLookUp;
}
