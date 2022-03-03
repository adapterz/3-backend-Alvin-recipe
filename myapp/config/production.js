module.exports = {
    mysqlurl: {
        host: process.env.databaseHost,
        port: process.env.databasePort,
        user: process.env.databaseUser,
        password: process.env.databasePassword,
        database: process.env.databaseName,
        dateStrings: 'date'
    },
    port: 80
};
