const express = require('express');
const cors = require('cors');
const path = require('path');
//const fs= require('fs');
const app = express();
app.set('query parser', 'extended');
const morgan= require('morgan');
//Routers
const userRouter= require(`./routes/userRoutes`)
const projectRouter = require('./routes/projectRoutes');
const taskRouter = require('./routes/taskRoutes');
const globalErrorHandler = require('./controllers/errorController');

//1. MIDDLEWARE
//app.use(morgan('short')); //third party middleware 
if(process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));


app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));

app.use(express.static(`${__dirname}/img`)); //built in middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);

// For handling errors globally
app.use(globalErrorHandler);



//4. STARTING THE SERVER
module.exports= app;
