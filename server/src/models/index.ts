'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import { sequelize } from './db';

dotenv.config();

const db: any = { sequelize, Sequelize, DataTypes };

// Dynamically import model files
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => 
    file.indexOf('.') !== 0 && 
    file !== path.basename(__filename) && 
    file !== 'db.ts' &&
    (file.slice(-3) === '.ts' || file.slice(-3) === '.js')
  );

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const model = require(modelPath);
  
  if (model.default) {
    // For ES module exports
    const ModelClass = model.default;
    if (typeof ModelClass === 'function') {
      db[ModelClass.name] = ModelClass;
    }
  } else {
    // For CommonJS exports
    if (typeof model === 'function') {
      const ModelClass = model(sequelize, DataTypes);
      db[ModelClass.name] = ModelClass;
    }
  }
}

// Setup associations if needed
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;