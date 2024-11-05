// types/config.types.ts
export interface IAppConfig {
    env: string;
    port: number;
    version: string;
    corsOrigin: string[];
    rateLimitWindow: number;
    rateLimitMax: number;
  }
  
  export interface IDocsConfig {
    enabled: boolean;
    username: string;
    password: string;
  }
  
  export interface IRedisConfig {
    host: string;
    port: number;
    password?: string;
  }
  
  export interface IDatabaseConfig {
    uri: string;
    options: {
      useNewUrlParser: boolean;
      useUnifiedTopology: boolean;
    };
  }