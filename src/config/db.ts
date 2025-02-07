import * as dotenv from 'dotenv';

interface DbConfig {
 use_env_variable: string;
 dialectOptions?: {
   ssl: {
     rejectUnauthorized: boolean;
     require: boolean;
   }
 }
}

interface Config {
 development: DbConfig;
 production: DbConfig;
 qa: DbConfig;
}

const config: Config = {
 development: {
   use_env_variable: 'DATABASE_URL'
 },
 production: {
   dialectOptions: {
     ssl: {
       rejectUnauthorized: false,
       require: true
     }
   },
   use_env_variable: 'DATABASE_URL'
 },
 qa: {
   dialectOptions: {
     ssl: {
       rejectUnauthorized: false,
       require: true
     }
   },
   use_env_variable: 'DATABASE_URL'
 }
};

export default config;