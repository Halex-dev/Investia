export const type = 'postgres';
export const host = process.env.DB_HOST;
export const port = parseInt(process.env.DB_PORT, 10) || 5432;
export const username = process.env.DB_USERNAME;
export const password = process.env.DB_PASSWORD;
export const database = process.env.DB_NAME;
export const entities = ['dist/**/*.entity{.ts,.js}'];
export const migrations = ['dist/migrations/*{.ts,.js}'];
export const cli = {
  migrationsDir: 'src/migrations',
};
export const synchronize = true;
