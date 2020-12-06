const sequelize = require("sequelize");
const fs = require("fs");
const infoSchema = new sequelize("information_schema", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});
let queries = "";
infoSchema
  .query(
    `  SELECT concat('ALTER TABLE ', TABLE_NAME, ' DROP FOREIGN KEY ', CONSTRAINT_NAME, ';') as statement
    FROM information_schema.key_column_usage
    WHERE CONSTRAINT_SCHEMA = 'martolex-new' 
    AND referenced_table_name IS NOT NULL`,
    { raw: true, type: sequelize.QueryTypes.SELECT }
  )
  .then((data) => {
    data.forEach((query) => {
      queries += query.statement;
    });
    fs.writeFileSync("foreign.txt", queries);
  });

let indexQueries = "";
infoSchema
  .query(
    `SELECT concat('ALTER TABLE ', TABLE_NAME, ' DROP INDEX ', CONSTRAINT_NAME, ';')  as statement
    FROM information_schema.key_column_usage
    WHERE CONSTRAINT_SCHEMA = 'martolex-new' and CONSTRAINT_NAME != "PRIMARY"`,
    { raw: true, type: sequelize.QueryTypes.SELECT }
  )
  .then((data) => {
    data.forEach((query) => {
      indexQueries += query.statement;
    });
    fs.writeFileSync("indexes.txt", indexQueries);
  });
