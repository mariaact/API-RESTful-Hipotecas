const sqlite3 = require('sqlite3');

let db;

const connectToDatabase = () => {
    //Conexión a la base de datos
    db = new sqlite3.Database('./Clientes.db', (err) =>{
        if(err) {
            console.log('Error al conectarse a la base de datos:', err.message);
        }else{
            console.log('Conexión exitosa a SQLite');
        }
    });
    
};

//Obtener la conexión a la base de datos
const getDB = () => {
    return db;
}

/*
//Cerrar la conexión
db.close((err) => {
    if(err) {
        console.log('Error al cerrar la base de datos:', err.message);
    }else{
        console.log('Conexión cerrada')
    }
});*/

// Exportar el método
module.exports = {
    connectToDatabase,
    getDB
  };