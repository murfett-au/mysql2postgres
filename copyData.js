import { config } from "./config";
const { Sequelize, Op, DataTypes } = require("sequelize");
const solarFieldNames = [
  `battSoc`,
  `panelV`,
  `panelI`,
  `loadV`,
  `loadI`,
  `battV`,
  `battI`,
  `battTemp`,
  `panelW`,
  `loadW`,
  `tempEquip`,
  `ambientTemp`,

  `msb`,
  `lsb`,
];

const solarFields = {
  ts: {
    type: DataTypes.TEXT,
  },
  loadState: { type: DataTypes.TEXT },
};
solarFieldNames.map((fieldName) => {
  solarFields[fieldName] = { type: DataTypes.FLOAT };
});

const dataTableFields = {
  ts: { type: DataTypes.DATE },
  sensor: { type: DataTypes.TEXT },
  value: { type: DataTypes.FLOAT },
  units: { type: DataTypes.TEXT },
};

const dataRangeTableFields = {
  ts: { type: DataTypes.DATE },
  sensor: { type: DataTypes.TEXT },
  min: { type: DataTypes.FLOAT },
  max: { type: DataTypes.FLOAT },
  average: { type: DataTypes.FLOAT },
  units: { type: DataTypes.TEXT },
};
async function copyMariaDbToPostgres({
  tableName,
  fields,
  primaryKeyField = "id",
}) {
  const postgres = new Sequelize("yapeen", "postgres", "postgres", {
    host: "localhost",
    dialect: "postgres",
  });
  const mariaDb = new Sequelize(
    config.mysql.database,
    config.mysql.username,
    config.mysql.password,
    {
      host: config.mysql.host,
      dialect: config.mysql.dialect,
    }
  );
  let source;
  let dest;
  postgres
    .authenticate()
    .then(function (result) {
      return mariaDb.authenticate();
    })
    .then(async function (result) {
      source = mariaDb.define(tableName, fields, {
        tableName,
        timestamps: false,
      });
      dest = postgres.define(tableName, fields, {
        tableName,
        timestamps: false,
      });

      await source.sync({ logging: false });
      await dest.sync({ logging: false });
      // get last row in dest:
      let lastRow = await dest.findOne({ order: [[primaryKeyField, "desc"]] });
      let rows;
      let iGlobal = 0;
      do {
        findAllParams = {
          logging: false,
          limit: 100,
          order: [[primaryKeyField, "asc"]],
        };
        // lastRow is null if the destination is empty
        if (lastRow)
          findAllParams.where = {
            [primaryKeyField]: { [Op.gt]: lastRow[primaryKeyField] },
          };
        const promises = [];
        rows = await source.findAll(findAllParams);
        rows.forEach(async function (row, i) {
          promises.push(dest.create(row.dataValues, { logging: false }));
        });
        const newRows = await Promise.all(promises);
        newRows.forEach((row) => {
          console.log(`${tableName} #${++iGlobal} ${row.dataValues.ts}`);
          lastRow = row;
        });
      } while (rows.length > 0);
    })
    .catch((e) => {
      console.error(e);
    });
}
async function copyAllData() {
  await copyMariaDbToPostgres({
    tableName: "data",
    fields: dataTableFields,
  });
  await copyMariaDbToPostgres({
    tableName: "solar",
    fields: solarFields,
  });
  await copyMariaDbToPostgres({
    tableName: "dataRange",
    fields: dataRangeTableFields,
  });
}
copyAllData();
