export default () => ({
  port: parseInt(process.env.PORT || '3001', 10) || 3001,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'username',
    password: process.env.DATABASE_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || 'name',
  },
  jwt_secret: process.env.JWT_SECRET || '',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || '',
  crypto_secret_key: process.env.CRYPTO_SECRET_KEY || '',
  mailer: {
    host: process.env.MAILER_HOST || '',
    port: parseInt(process.env.MAILER_PORT || '587', 10) || 587,
    user: process.env.MAILER_USER || '',
    pass: process.env.MAILER_PASS || '',
  },
  bullmq_connection_url: process.env.BULLMQ_CONNECTION_URL || '',
  node_env: process.env.NODE_ENV || 'development',
  frontend_url: process.env.FRONTEND_URL || '',
});
