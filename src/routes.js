import fs from "node:fs/promises";
import * as fsOld from "node:fs";
import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";
import { databasePath } from "./database.js";

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
      console.log(req.body);
      const { title, description } = req.body;
      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
      };
      database.insert("Tasks", task);
      return res.end(JSON.stringify(task));

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
      console.log("PUT");
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
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handleBody: true,
    async action(req, res) {
      const { id } = req.params;
      console.log("DELETE");
      const taskToDelete = await fs
        .readFile(databasePath, "utf-8")
        .then((data) => {
          data = JSON.parse(data);
          return data["Tasks"]?.find((t) => t.id === id);
        });
      console.log("taskToDelete");
      console.log(taskToDelete);
      console.log(!!taskToDelete);

      if (taskToDelete) {
        database.delete("Tasks", id);
        return res.end(JSON.stringify(taskToDelete));
      }
      res.write("Task does not exist");
      return res.end();
    },
  },
];
