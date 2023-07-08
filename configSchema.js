const { DataTypes } = require("sequelize");

module.exports = {
  configSchema: {
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
    },
  }
};
