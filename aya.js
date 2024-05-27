const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ortegam12',
  database: 'aya'
});

conexion.connect(error => {
  if (error) {
    console.error('Problemas de conexion con MySQL:', error);
  } else {
    console.log('Conexión a MySQL exitosa');
  }
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('aya'));

///////////////////////////////////////////////
//Aqui voy a poner los metodos get y post

app.post('/aya/agregar_casa', async (req, res) => {
  try {
    const { Direccion} = req.body;
    const insercionQuery = `INSERT INTO InfoCasa (Direccion) VALUES ('${Direccion}')`;

    conexion.query(insercionQuery, (error) => {
      if (error) {
        console.error('Error al insertar datos en la base de datos:', error);
        res.status(500).send('Error interno');
      } else {
        console.log('Datos insertados correctamente');
        res.redirect('/'); // Redirigir de vuelta a la página principal
      }
    });
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).send('Error interno: ' + error.message);
  }
});


app.post('/aya/agregar_cliente', async (req, res) => {
  try {
    const { Nombre, Ducha, Lavatorio,Dientes, Fregadero, Vehiculo, Servicio, Ropa, Comida, idCasa } = req.body;

    const duracionDucha = parseInt(Ducha) * 12;
    const duracionLavatorio = parseInt(Lavatorio) * 6;
    const duracionDientes = parseInt(Dientes) * 6;
    const duracionFregadero = parseInt(Fregadero) * 8;
    const duracionVehiculo = parseInt(Vehiculo) * 10;
    const duracionServicio = parseInt(Servicio) * 10;
    const duracionRopa = parseInt(Ropa) * 13;
    const duracionComida = parseInt(Comida) * 12;

    const Total = duracionDucha +duracionLavatorio + duracionDientes + duracionFregadero + duracionVehiculo + duracionServicio + duracionRopa + duracionComida
    
    const cubicos = Total / 1000
    
    let Tarifa;

     if (cubicos < 15) {
      Tarifa = 3865;
    } else if (cubicos < 25) {
      Tarifa = 5346;
    } else if (cubicos < 40) {
      Tarifa = 5429;
    } else if (cubicos < 60) {
      Tarifa = 5610;
    } else if (cubicos < 80) {
      Tarifa = 6552;
    } else if (cubicos < 100) {
      Tarifa = 6559;
    } else if (cubicos < 120) {
      Tarifa = 6563;
    } else if (cubicos > 121) {
      Tarifa = 6862;
    }

    const TarifaTotal = Tarifa * cubicos
    const insercionQuery = `INSERT INTO Usuarios (Nombre, Ducha, Lavatorio,Dientes, Fregadero, Vehiculo, Servicio, Ropa, Comida, idCasa, Total, Cubicos, TarifaTotal ) VALUES ('${Nombre}','${Ducha}', '${Lavatorio}','${Dientes}', '${Fregadero}', '${Vehiculo}', '${Servicio}', '${Ropa}', '${Comida}', ${idCasa}, '${Total}', '${cubicos}', '${TarifaTotal}')`;
    conexion.query(insercionQuery, (error) => {
      if (error) {
        console.error('Error al insertar datos en la base de datos:', error);
        res.status(500).send('Error interno');
      } else {
        console.log('Datos insertados correctamente');
        res.redirect('/'); // Redirigir de vuelta a la página principal
      }
    });
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).send('Error interno: ' + error.message);
  }
});

app.get('/obtener-casa', async (req, res) => {
  try {
    // Consulta para obtener los datos de la base de datos
    const consultaQuery = 'SELECT idCasa, Direccion FROM infoCasa '
    
    
    // Ejecutamos la consulta en la base de datos
    conexion.query(consultaQuery, (error, resultados) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error interno');
      } else {
        // Enviamos los resultados al cliente
        res.status(200).json(resultados);
      }
    });
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).send('Error interno: ' + error.message);
  }
});

app.get('/obtener-info', async (req, res) => {
  try {
    // Consulta para obtener los datos de la base de datos
    const consultaQuery = 'SELECT u.idUsuario, u.Nombre, u.Total, u.Cubicos, u.TarifaTotal, i.idCasa , i.Direccion AS DireccionCasa FROM Usuarios u JOIN InfoCasa i ON u.idCasa = i.idCasa;'
    
    conexion.query(consultaQuery, (error, resultados) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error interno');
      } else {
        // Enviamos los resultados al cliente
        res.status(200).json(resultados);
      }
    });
  } catch (error) {
    console.error('Error interno:', error);
    res.status(500).send('Error interno: ' + error.message);
  }
});

app.post('/aya/obtener-usuario', async (req, res) => {
  try {
      const { username, contraseña } = req.body;

      // Llamar al proceso almacenado 
      conexion.query('CALL Validarusers(?, ?)', [username, contraseña], (error, results) => { 
          if (error) {
              console.error('Error al ejecutar el procedimiento almacenado:', error);
              res.status(500).send('Error interno');
              return;
          }

          if (!results[0] || !results[0][0]) {
              
              res.status(401).send('<!doctype html><html><head></head><body><script>alert("Credenciales inválidas. Por favor, inténtelo de nuevo."); window.location.href = "/login.html";</script></body></html>');
              return;
          }

          const isValid = results[0][0].IsValid;
          if (isValid === 1) {
              res.send('<!doctype html><html><head></head><body><script>alert("¡Bienvenido al sistema!"); window.location.href = "/casa.html";</script></body></html>');  
          } else {
              
              res.status(401).send('<!doctype html><html><head></head><body><script>alert("Credenciales inválidas. Por favor, inténtelo de nuevo."); window.location.href = "/login.html";</script></body></html>');
          }
      });
  } catch (error) {
      console.error('Error de consola:', error);
      res.status(500).send('Error stat: ' + error.message);
  }
});


///////////////////////////////////////////////

//Esta me esta ayudado con los recursos estaticos 
app.get('/', async (req, res) => {
  const ruta = path.join(__dirname, 'login.html');
  try {
    const stats = await fs.stat(ruta);

    if (stats.isFile()) {
      const contenido = await fs.readFile(ruta);
      const contentType = 'text/html';

      res.status(200).contentType(contentType).send(contenido);
    } else {
      res.status(404).send('<!doctype html><html><head></head><body>La página no existe</body></html>');
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('<!doctype html><html><head></head><body>La página no existe</body></html>');
    } else {
      console.error('Error interno:', error);
      res.status(500).send('Error interno: ' + error.message);
    }
  }
});


app.listen(port, () => {
    console.log(`Servidor web iniciado en http://localhost:${port}`);
});
