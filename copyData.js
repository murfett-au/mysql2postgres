try {
  configExports = require("./config");
} catch (e) {
  console.error(e);
  console.error(
    `Please create config.js by copying configSample.js and editing it.`
  );
  process.exit(1);
}
const config = configExports.config;
const { configSchema } = require("./configSchema");
console.debug("configSchema", configSchema);
const { Sequelize, Op, DataTypes } = require("sequelize");


const solarFields = configSchema.tables.solar.nonFloatFields;
configSchema.tables.solar.floatFieldNames.map((fieldName) => {
  solarFields[fieldName] = { type: DataTypes.FLOAT };
});

const dataTableFields = configSchema.tables.data.fields;

const dataRangeTableFields = configSchema.tables.dataRange.fields;


console.log(`Connecting to destination`);
const destdb = new Sequelize(config.dest.database, config.dest.username, config.dest.password, {
  host: config.dest.host,
  dialect: config.dest.dialect,
  port: config.dest.port,

});
console.log(`Connecting to source`);
const sourceDb = new Sequelize(
  config.source.database,
  config.source.username,
  config.source.password,
  {
    host: config.source.host,
    dialect: config.source.dialect,
    port: config.source.port,
  }
);
console.log(`Connected to source and destination`)


async function copySourceDbToDest({
  tableName,
  fields,
  primaryKeyField = "id",
}) {  let source;
  let dest;
  console.debug(`authenticating with destination for table '${tableName}'`)
  await destdb
    .authenticate()
    .then(function (result) {
      console.debug(`authenticating with source for table '${tableName}'`)
      return sourceDb.authenticate();
    })
    .then(async function (result) {
      source = sourceDb.define(tableName, fields, {
        tableName,
        timestamps: false,
      });
      dest = destdb.define(tableName, fields, {
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
  await copySourceDbToDest({
    tableName: "data",
    fields: dataTableFields,
  });
  await copySourceDbToDest({
    tableName: "solar",
    fields: solarFields,
  });
  await copySourceDbToDest({
    tableName: "dataRange",
    fields: dataRangeTableFields,
  });
}
copyAllData();
