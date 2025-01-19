var express = require('express');
var router = express.Router();
const dbo = require('../database/conn');
const sqlite3 = require('sqlite3');
const Ajv = require('ajv');
const ajv = new Ajv();

const fs = require('fs');
const clientePOSTPath = './schema/schemaClientePOST.json';
const clientePOSTContent = fs.readFileSync(clientePOSTPath, 'utf8');
const clientePUTPath = './schema/schemaclientePUT.json';
const clientePUTContent = fs.readFileSync(clientePUTPath, 'utf8');


/* GET /clientes */
router.get('/', function (req, res, next) {

  // Conectar a la base de datos
  dbo.connectToDatabase();

  //Obtener la conexión
  const dbConnect = dbo.getDB();

  // Realizar una consulta para obtener todos los datos de la tabla 'clientes'
  const results = dbConnect.all('SELECT * FROM Clientes', (err, rows) => {
    if (rows.length === 0) {
      // Si no hay clientes
      return res.status(404).send("404 - No hay clientes.");
    }
    if (err) {
      return res.status(500).send("500 - Ha ocurrido un error al consultar la base de datos.");
    } else {
      res.json(rows).status(200);
    }
  });

});

//Crear un nuevo cliente (POST)
router.post('/', async (req, res) => {

  //Obtener los dstos del nuevo cliente
  const cliente = req.body;

  //Validar que el JSON enviado en el POST tiene la estructura valida
  const json = validarJSON(req.body, JSON.parse(clientePOSTContent));

  if (json) {
    //Validar el DNI
    const sol = validar(cliente.dni);
    if (sol) {

      // Conectar a la base de datos
      dbo.connectToDatabase();

      //Obtener la conexión
      const dbConnect = dbo.getDB();

      //Consulta SQL para insertar al nuevo cliente
      const sql = `INSERT INTO Clientes (nombre, dni, email, capitalSolicitado) VALUES (?,?,?,?)`;

      //Insertar los datos
      dbConnect.run(sql, [cliente.nombre, cliente.dni, cliente.email, cliente.capitalSolicitado], function (err, solucion) {
        if (err) {
          res.send("400 - Solicitud realizada incorrectamente por el cliente debido a los parámetros.").status(400);
        }
        res.status(201).send({
          message: 'cliente creado correctamente',
          id: this.lastID, // Obtiene el ID del registro recién creado
        });
      });
    } else {
      res.send("400 - Solicitud realizada incorrectamente por el cliente debido a los parámetros.").status(400);
    }
  } else {
    res.send("400 - Solicitud realizada incorrectamente por el cliente debido a los parámetros.").status(400);
  }
});

//Crear un nuevo cliente (POST)
router.put("/:id", async function (req, res, next) {
  const nuevo_id = req.params.id;
  const datosActualizados = req.body;

  // Extraer los campos a actualizar dinámicamente
  const campos = Object.keys(datosActualizados);
  const valores = Object.values(datosActualizados);

  // Construir la cláusula SET dinámicamente
  const setClause = campos.map(campo => `${campo} = ?`).join(", ");
  const consulta = `UPDATE Clientes SET ${setClause} WHERE id_clientes = ?`;

  // Agregar el ID del cliente al final de los valores
  valores.push(nuevo_id);

  const valido = validarJSON(datosActualizados, JSON.parse(clientePUTContent));
  if (valido) {
    //Verifica el dni
    if (datosActualizados.dni != null) {
      const sol = validar(datosActualizados.dni);
      if (sol) {

        // Conectar a la base de datos
        dbo.connectToDatabase();

        //Obtener la conexión
        const dbConnect = dbo.getDB();

        // Comprobar si el cliente existe antes de intentar actualizarlo
        const clienteExistente = await new Promise((resolve, reject) => {
          dbConnect.get("SELECT * FROM Clientes WHERE id_clientes = ?", [nuevo_id], (err, row) => {
            if (err) {
              reject("500 - Error al consultar la base de datos.");
            } else if (!row) {
              resolve(null); // Cliente no encontrado
            } else {
              resolve(row); // Cliente encontrado
            }
          });
        });

        if (!clienteExistente) {
          return res.status(404).send("404 - No existe un cliente con ese identificador.");
        }

        // Ejecutar la consulta de actualización
        dbConnect.run(consulta, valores, function (err) {
          if (err) {
            return res.status(500).send("500 - Ha ocurrido un error al consultar la base de datos.");
          }
          return res.status(200).send({
            mensaje: 'cliente actualizado correctamente',
            id: nuevo_id // Obtiene el ID del registro actualizado
          }).status(200);
        });

      } else {
        res.send("400 - Solicitud realizada incorrectamente por el cliente debido a los parámetros.").status(400);
      }

    } else {
      // Conectar a la base de datos
      dbo.connectToDatabase();

      //Obtener la conexión
      const dbConnect = dbo.getDB();

      // Comprobar si el cliente existe antes de intentar actualizarlo
      const clienteExistente = await new Promise((resolve, reject) => {
        dbConnect.get("SELECT * FROM Clientes WHERE id_clientes = ?", [nuevo_id], (err, row) => {
          if (err) {
            reject("500 - Error al consultar la base de datos.");
          } else if (!row) {
            resolve(null); // Cliente no encontrado
          } else {
            resolve(row); // Cliente encontrado
          }
        });
      });

      if (!clienteExistente) {
        return res.status(404).send("404 - No existe un cliente con ese identificador.");
      }

      // Ejecutar la consulta de actualización
      dbConnect.run(consulta, valores, function (err) {
        if (err) {
          return res.status(500).send("500 - Ha ocurrido un error interno en el servidor.");
        }
        return res.status(200).send({
          mensaje: 'cliente actualizado correctamente',
          id: nuevo_id // Obtiene el ID del registro actualizado
        });
      });
    }
  } else {
    return res.status(400).send("400 - Solicitud realizada incorrectamente por el cliente debido a los parámetros.");
  }
});

//Borrar un cliente
router.delete('/:id', async function (req, res, next) {
  const clienteId = req.params.id;

  // Conectar a la base de datos
  dbo.connectToDatabase();

  //Obtener la conexión
  const dbConnect = dbo.getDB();

  // Consulta para borrar a cliente
  const sql = `DELETE FROM CLIENTES WHERE id_clientes = ?`;

  //Borrar los datos
  dbConnect.run(sql, [clienteId], function (err) {
    if (err) {
      return res.status(500).send("500 - Ha ocurrido un error al consultar la base de datos.");
    }

    if (this.changes === 0) {
      return res.status(404).send("404 - No existe un cliente con ese identificador.");
    } else {
      return res.status(200).send(
        { message: 'Toda la información del cliente se ha eliminado correctamente' }).status(200);
    }
  });
});

/* GET /clientes */
router.get('/:id', async function (req, res, next) {
  const clienteId = req.params.id;

  // Conectar a la base de datos
  dbo.connectToDatabase();

  //Obtener la conexión
  const dbConnect = dbo.getDB();

  // Comprobar si el cliente existe antes de intentar actualizarlo
  const clienteExistente = await new Promise((resolve, reject) => {
    dbConnect.get("SELECT * FROM Clientes WHERE id_clientes = ?", [clienteId], (err, row) => {
      if (err) {
        reject("500 - Error al consultar la base de datos.");
      } else if (!row) {
        resolve(null); // Cliente no encontrado
      } else {
        resolve(row); // Cliente encontrado
      }
    });
  });

  if (!clienteExistente) {
    return res.status(404).send("404 - No existe un cliente con ese identificador.");
  }
  // Consulta para borrar a cliente
  const sql = `SELECT * FROM Clientes WHERE id_clientes = ?`;

  //Borrar los datos
  dbConnect.get(sql, [clienteId], function (err, rows) {
    if (err) {
      res.send("500 - Ha ocurrido un error al consultar la base de datos").status(500);
    }

    console.log(this.changes, '----', rows)
    if (this.changes === 0) {
      res.send("404 - No existe un cliente con ese identificador").status(404);
    } else {
      res.send(rows).status(200);
    }

  });

});

/* GET hipoteca de un cliente */
router.get('/:id/hipoteca', function (req, res, next) {
  //Obtengo los datos de los parametros
  const clienteId = req.params.id;
  const { tae, plazo } = req.body;

  if (!tae || !plazo) {
    res.send("400 - Solicitud realizada incorrectamente por el cliente debido a los parámetros.").status(400);
  } else {
    // Conectar a la base de datos
    dbo.connectToDatabase();

    //Obtener la conexión
    const dbConnect = dbo.getDB();

    // Consulta para obtener informacion del cliente
    const sql = `SELECT * FROM Clientes WHERE id_clientes = ?`;

    const result = dbConnect.get(sql, [clienteId], function (err, rows) {
      if (typeof rows === 'undefined') {
        // Si no existe el clientes
        return res.status(404).send("404 - No existe un cliente con ese identificador.");
      }

      if (err) {
        return res.status(500).send("500 - Ha ocurrido un error al consultar la base de datos.");
      } else {
        const capital = rows.capitalSolicitado

        //tipo de interés mensual
        const i = tae / 100 / 12;

        // Plazo en meses
        const n = plazo * 12;

        const cuota = (capital * i) / (1 - Math.pow(1 + i, -n));
        const totalDevolver = cuota * n;

        // Consulta de actualización (solo de los dos últimos campos)
        const sql = `
          INSERT INTO Hipoteca
          (cuotaMensual, importeTotalDevolver, clienteID)
          VALUES (?, ?, ?)`;

        // Ejecutar la consulta
        dbConnect.run(sql, [cuota.toFixed(2), totalDevolver.toFixed(2), clienteId], function (err) {
          if (err) {
            return res.status(500).send("500 - Ha ocurrido un error al consultar la base de datos.");
          }
          // Respuesta con los resultados
          return res.status(200).json({
            clienteId,
            cuotaMensual: cuota.toFixed(2),
            totalDevolver: totalDevolver.toFixed(2),
          });
        });
      }
    });

  }



});

function validar(value) {

  var validChars = 'TRWAGMYFPDXBNJZSQVHLCKET';
  var nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;
  var nieRexp = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]$/i;
  console.log('*-*-*-*-*-', value)
  var str = value.toString().toUpperCase();

  if (!nifRexp.test(str) && !nieRexp.test(str)) return false;

  var nie = str
    .replace(/^[X]/, '0')
    .replace(/^[Y]/, '1')
    .replace(/^[Z]/, '2');

  var letter = str.substr(-1);
  var charIndex = parseInt(nie.substr(0, 8)) % 23;

  if (validChars.charAt(charIndex) === letter) return true;

  return false;
}

function validarJSON(json, schema) {
  const validar = ajv.compile(schema);
  console.log(validar)
  const valido = validar(json);
  console.log(valido)

  if (!valido) {
    console.log(validar.errors);
    return false;
  }

  return true;
}


module.exports = router;
