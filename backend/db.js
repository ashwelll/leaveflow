const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'leaveflow_hrms',
    port: 3307
});

connection.connect((err) => {
    if(err){
        console.log('Database Connection Failed');
        console.log(err);
    } else {
        console.log('MySQL Connected Successfully');
    }
});

module.exports = connection;