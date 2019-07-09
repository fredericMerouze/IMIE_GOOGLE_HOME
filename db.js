const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'remotemysql.com',
  user: 'yGLpPq40EG',
  password: 'wvqKAIcpK1',
  database: 'yGLpPq40EG',
  debug: false,
  multipleStatements: true
});