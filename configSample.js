module.exports = {
  config: {
    source: {
      password: "{put your password here}",
      database: "{put your database name here}",
      username: "{put your username here}",
      host: "{put your host here}",
      dialect: "mariadb", // Not tested for other dialects
    },
    dest: {
      password: "postgrespassword", // matches docker-compose.yml environment setting
      database: "{put your database name here}",
      username: "{put your username here}",
      host: "{put your host here}",
      dialect: "postgres", // Not tested for other dialects
    }
  },
  tables: {
    data: {
      fields: {
        ts: { type: DataTypes.DATE },
        sensor: { type: DataTypes.TEXT },
        value: { type: DataTypes.FLOAT },
        units: { type: DataTypes.TEXT },
      },
    },
    dataRange: {
      ts: { type: DataTypes.DATE },
      sensor: { type: DataTypes.TEXT },
      min: { type: DataTypes.FLOAT },
      max: { type: DataTypes.FLOAT },
      average: { type: DataTypes.FLOAT },
      units: { type: DataTypes.TEXT },
    },
    solar: {
      floatFieldNames:[
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
      ],
      nonFloatFields: {
        ts: {
          type: DataTypes.TEXT,
        },
        loadState: { type: DataTypes.TEXT },
      },      
    }
  }
};
