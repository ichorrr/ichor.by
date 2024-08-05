// Require the mongose library
import pkg from 'mongoose';
const { set, connect: _connect, connection } = pkg;

export function connect(DB_HOST) {
  // Use the Mongo driver's updated URL string parser
  set('useNewUrlParser', true);
  // Use `findOneAndUpdate()` in place of findAndModify()
  set('useFindAndModify', false);
  // Use `createIndex()` in place of `ensureIndex()`
  set('useCreateIndex', true);
  // Use the new server discovery & monitoring engine
  set('useUnifiedTopology', true);
  // Connect to the DB
  _connect(DB_HOST);
  // Log an error if we fail to connect
  connection.on('error', err => {
    console.error(err);
    console.log(
      'MongoDB connection error. Please make sure MongoDB is running.'
    );
    process.exit();
  });
}
export function close() {
  connection.close();
}
