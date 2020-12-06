const sequelize = require("sequelize");

const infoSchema = new sequelize("information_schema", "root", "", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
});

infoSchema
  .query(
    ` SELECT concat('ALTER TABLE ', TABLE_NAME, ' DROP INDEX ', CONSTRAINT_NAME, ';')  as statement
    FROM information_schema.key_column_usage 
    WHERE CONSTRAINT_SCHEMA = 'martolex-new' and CONSTRAINT_NAME != "PRIMARY" LIMIT 0,500;`,
    { raw: true, type: sequelize.QueryTypes.SELECT }
  )
  .then((data) => {
    data.forEach((query) => {
      console.log(query.statement);
    });
  });
