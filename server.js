/**
 * Created by Ash Zhang on 2015/12/24.
 */


var express = require('express'),
    PORT = 9000,
    app = express();


// Settings
// ---------------------------

app.disable('x-powered-by');
app.set('port', process.env.PORT || PORT);


// Middleware
// ---------------------------

app.use(express.static(__dirname + '/example'));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});


// Routers
// ---------------------------

// API
app.head('/*', function (req, res) {
  res.sendStatus(200);
});

app.all('/*', function (req, res) {
  //res.status(400);

  setTimeout(() => {
    res.json({
      //success: false,
      fetched: true
    });
  }, 100);
});


// Listening
// ---------------------------

app.listen(app.get('port'), function () {
  console.log('Listening at port: ' + app.get('port'));
});
