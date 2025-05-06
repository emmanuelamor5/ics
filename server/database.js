const{Pool} = require('pg');

const pool = new Pool({
    server:"PostgreSQL 13",
    user: "postgres",
    host: "localhost",
    password:"Emmanuel2004&",
    port: 5432,
    database:"login_system",
});


module.exports = pool;