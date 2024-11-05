// types/config.types.ts
export interface IJWTConfig {
    secret: string;
    expiresIn: string | number;
    refreshExpiresIn: string | number;
  }
  
  export interface IArweaveConfig {
    host: string;
    port: number;
    protocol: string;
    timeout: number;
    logging: boolean;
    key: any;
  }
  
  export interface IDatabaseConfig {
    uri: string;
    options: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
      useCreateIndex: boolean;
      useFindAndModify: boolean;
    };
  }
  
  export interface IAppConfig {
    port: number;
    env: string;
    corsOrigin: string | string[];
    rateLimitWindow: number;
    rateLimitMax: number;
  }