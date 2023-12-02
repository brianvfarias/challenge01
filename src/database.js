import fs from "node:fs/promises";

export const databasePath = new URL("./db.json", import.meta.url);

export class Database {
  #database = {};

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].includes(value);
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(
      (record) => record.id === id
    );

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }

  update(table, id, data) {
    const row = this.#database[table].find((record) => record.id === id);

    if (row) {
      console.log("if update");
      row;
      let index = this.#database[table].indexOf(row);
      this.#database[table][index] = { ...row, ...data };
      this.#persist();
      return this.#database[table][index];
    }
  }
}
