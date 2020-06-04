const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const Bootcamp = require('./models/Bootcamp');

// Connect to DB
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
);

// Read JSON file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

// Import to DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);

    console.log('Imported...'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

// Delete data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();

    console.log('Deleted...'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
}

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}