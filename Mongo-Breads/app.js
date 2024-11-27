var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { MongoClient } = require('mongodb');

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const dbName = "todos";

async function main() {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  return db;
}

main()
  .then((db) => {
    var indexRouter = require('./routes/index')(db);
    var usersRouter = require('./routes/users')(db);
    var todosRouter = require('./routes/todos')(db);

    const app = express();

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(function (req, res, next) {

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', true);

      next();
    });

    app.use('/', indexRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/todos', todosRouter);

    var debug = require('debug')('mongodb-breads:server');
    var http = require('http');

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    var server = http.createServer(app);


    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function normalizePort(val) {
      var port = parseInt(val, 10);

      if (isNaN(port)) {
        return val;
      }

      if (port >= 0) {
        return port;
      }

      return false;
    }

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      debug('Listening on ' + bind);
    }
  })
  .catch((err) => {
    console.log(err)
  })