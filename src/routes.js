import fs from "node:fs/promises";
import * as fsOld from "node:fs";
import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

import { verifyTaskInDB } from "./utils/verify-in-db.js";

const database = new Database();
export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handleBody: true,
    async action(req, res) {
      const fileURL = new URL("./db.json", import.meta.url);

      let fileExists = fsOld.existsSync(fileURL);
      console.log(fileExists);
      if (fileExists) {
        console.log("entrou no if");
        const response = await fs.readFile(
          "src/db.json",
          import.meta,
          (err) => {
            if (err) {
              res.writeHead(404).write("Not found");
            } else {
              Database.select("Tasks");
            }
          }
        );

        res.end(response);
      } else {
        res.writeHead(404).write("Not found");
      }
    },
  },
  // {
  //   method: "GET",
  //   path: "/users",
  //   handleBody: true,
  //   action(req, res) {
  //     return res.writeHead(200).end("Listar usuários");
  //   },
  // },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handleBody: true,
    action(req, res) {
      const { title, description } = req.body;
      if (title && description) {
        const task = {
          id: randomUUID(),
          title,
          description,
          created_at: new Date(),
        };
        database.insert("Tasks", task);
        return res.end(JSON.stringify(task));
      }
      return res.end("Invalid");

      // if (dbExists) {
      //   addData = `${body.title},${body.description};\n`;
      // } else {
      //   const csvHeader = "title, description;\n";
      //   addData = `${csvHeader}${body.title},${body.description};\n`;
      // }
      // fs.appendFile("db.csv", addData)
      //   .then(() => res.end(JSON.stringify(body)))
      //   .catch((err) => {
      //     throw err;
      //   });
      // let addData;
      // const dbExists = fsOld.existsSync("db.json");
      // addData = dbExists ? +JSON.stringify(body) : +JSON.stringify(body);
      // fs.appendFile("db.json", addData)
      //   .then(() => res.end(JSON.stringify(body)))
      //   .catch((err) => {
      //     throw err;
      //   });
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handleBody: true,
    async action(req, res) {
      const { id } = req.params;
      const taskToUpdate = await verifyTaskInDB(id);
      console.log(taskToUpdate);
      // console.log("PUT");
      if (taskToUpdate) {
        const body = req.body;
        let update = {};
        for (const key in body) {
          if (body[key]) {
            update[key] = body[key];
          }
        }
        update.update_at = new Date();
        update = database.update("Tasks", id, update);
        return res.end(JSON.stringify(update));
      }
      res.write("Task does not exist");
      return res.end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handleBody: true,
    async action(req, res) {
      const { id } = req.params;
      // console.log("DELETE");
      const taskToDelete = await verifyTaskInDB(id);
      if (taskToDelete) {
        database.delete("Tasks", id);
        return res.end(JSON.stringify(taskToDelete));
      }
      res.write("Task does not exist");
      return res.end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handleBody: true,
    async action(req, res) {
      const { id } = req.params;
      const taskToUpdate = await verifyTaskInDB(id);
      if (taskToUpdate) {
        let update;
        if (taskToUpdate["completed_at"]) {
          delete taskToUpdate["completed_at"];
          console.log("completed_at");
          taskToUpdate.markAsIncomplete = true;
          update = taskToUpdate;
          update = database.update("Tasks", id, update);
          return res.end(`Incomplete: {${JSON.stringify(update)}}`);
        }
        taskToUpdate["completed_at"] = new Date();
        update = taskToUpdate;
        update = database.update("Tasks", id, update);
        return res.end(`Complete: {${JSON.stringify(update)}}`);
      }
      return res.end("Task does not exist");
    },
  },
];
