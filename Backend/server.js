const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
.then(con => {
  console.log('DB connection successful!');
})
.catch(err => {
  console.log('DB connection error:', err.message);
});


// //creating a new tour doc
// const testTour = new Tour({
//   name: 'Paris',
//   price: 999
// });

// //Saving the document to the database
// testTour.save()
// .then(doc => {
//   console.log('Document saved:', doc);    
// })
// .catch(err => {
//   console.log('Error 💥:', err.message);
// }); it works correctly just used for testing the connection and schema


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});