const express = require('express');
//const fs= require('fs');
const app = express();
app.set('query parser', 'extended');
const morgan= require('morgan');

const userRouter= require(`./routes/userRoutes`)


//1. MIDDLEWARE
//app.use(morgan('short')); //third party middleware 
if(process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));


app.use(express.json());

app.use(express.static(`${__dirname}/img`)); //built in middleware to serve static files
//can use it using direct http://127.0.0.1:3000/coffeee.jpg


app.use((req, res, next)=>
{
    console.log("Hellooo from MIDDLEWARE 😊");
    next();
});

app.use((req, res, next)=>{
    req.requestTime= new Date().toISOString();
    console.log(req.headers);
    next();
});

//3. ROUTES

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);



//MOUNTING AND CALLING ALL ROUTERS

app.use('/api/v1/users', userRouter);

//For handling errors globally
app.use((err, req, res, next) => {
  console.log('ERROR 💥', err);

  res.status(err.statusCode || 400).json({
    status: 'fail',
    message: err.message
  });
});



//4. STARTING THE SERVER
module.exports= app;