var mongo = require('vs-mongo');

var Service = require('./lib/Service');
var Cluster = require('./lib/Cluster');


var create = exports.create = function create ( name, port, stun, url ) {
  var config = {
    services  : { dropSync: false },
    snapshots : { dropSync: false }
  }

  var db = mongo.connect(uri, config);

  return new Service(name, port, stun, db);
}

var cluster = exports.cluster = function cluster ( url, interval ) {
  var config = { services: { dropSync: false } }
  var db = mongo.connect(uri, config);

  return new Cluster(db);
}


if ( require.main === module && process.argv[2] == 'test' ) {
  var exec = require('child_process').exec;

  var log = function log ( error, value ) {
    console.log(error || value);
  }

  exec('node lib/Service.js', log);
  exec('node lib/Cluster.js', log);
}
