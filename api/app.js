var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var carrerasRouter = require('./routes/carreras');
var materiasRouter = require('./routes/materias')
var usersRouter = require('./routes/users')

var jwt = require('jsonwebtoken')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.post('/api/login', (req,res)=>{
  const user = {id:3};
  const token = jwt.sign({user}, 'my_secret_key');
  res.json({
    token
  });
});

app.get('/api/protected', ensureToken ,(req,res )=>{
  jwt.verify(req.token, 'my_secret_key', (err, data)=>{
    if(err){
      res.sendStatus(403)
    }
    else{
      res.json({
        text: 'protected',
        data
      })
    }
  })
})

function ensureToken(req,res,next){
  const bearerHeader = req.headers['authorization'];
  console.log(bearerHeader)
  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1]
    req.token = bearerToken
    next(); 
  }
  else{
    res.sendStatus(403) 
  }
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Router en uso
app.use('/us', usersRouter)
app.use('/mat', materiasRouter)
app.use('/car', carrerasRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
