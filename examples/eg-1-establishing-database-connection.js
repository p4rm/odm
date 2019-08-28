const {anysolsODM} = require('../');

const anysolsODM = new anysolsODM();

const config = {
    "host": "localhost",
    "port": "27017",
    "database": "anysols-collection",
    "dialect": "mongodb",
};

anysolsODM.connect(config).then(() => {
    console.log('connection success');
    anysolsODM.databaseExists().then(() => {
        console.log('db exists');
    }, () => {
        console.log("db does not exists");
    });
}, (err) => {
    console.log('connection failed');
});
