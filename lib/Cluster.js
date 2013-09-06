var cache = require('vs-cache');

var Cluster = module.exports = function Cluster ( db ) {
  this.db = db;

  this.list = [ ];
  this.hash = { }

  this.services = { }
}


Cluster.prototype.refresh = function refresh ( interval ) {
  var self = this;

  if ( interval > 0 ) {
    var task = function task ( callback ) {
      Cluster.retrieve(self, callback);
    }

    this.cache = cache.create(task, interval);
  }
  else this.cache = null;

  return this;
}

Cluster.prototype.cleanup = function cleanup ( interval ) {
  this.timeout = interval > 0 ? interval : null;

  return this;
}


Cluster.prototype.retrieve = function retrieve ( callback ) {
  if ( this.cache ) {
    this.cache.retrieve(callback);
  }
  else {
    Cluster.retrieve(this, callback);
  }
}

Cluster.prototype.selectOne = function selectOne ( name, callback ) {
  var self = this;

  var done = function done ( error, value ) {
    if ( error ) return callback(error);

    var list = value && value[name] || [ ];
    var best = null, rank = 0;

    for ( var i = 0; i < list.length; i += 1 ) {
      var service = list[i], current = 0;

      current += service.mem.free > 100 * MB ? service.mem.free / GB : -Infinity;
      current += ( 1 - service.load[2] / service.cpus.length ) * GB;
      current += ( 1 - service.load[1] / service.cpus.length ) * MB;
      current += ( 1 - service.load[0] / service.cpus.length ) * KB;

      if ( current > rank ) {
        best = service;
        rank = current;
      }
    }

    callback(null, best);
  }

  this.retrieve(done);
}

Cluster.prototype.selectAll = function selectAll ( name, callback ) {
  var self = this;

  var done = function done ( error, value ) {
    if ( error ) return callback(error);

    callback(null, value && value[name] || [ ]);
  }

  this.retrieve(done);
}


Cluster.retrieve = function retrieve ( cluster, callback ) {
  var retrieved = function retrieved ( error, value ) {
    if ( !error ) {
      var list = [ ], hash = { }, timestamp = new Date().getTime();

      for ( var i = 0; i < value.length; i += 1 ) {
        var service = value[i], id = service.doc._id, hashed = cluster.hash[id];
        var heartbeat = !hashed || hashed.doc.heartbeat != service.doc.heartbeat;
        var expired = !heartbeat && (timestamp - hashed.timestamp > cluster.timeout);

        if ( cluster.timeout && expired ) service.remove();
        else {
          service.timestamp = heartbeat ? timestamp : hashed.timestamp;

          list.push(service);

          hash[id] = service;
        }
      }

      cluster.hash = hash;
      cluster.list = list;
      cluster.services = { }

      for ( var i = 0; i < list.length; i += 1 ) {
        var service = list[i], name = service.doc.name;
        var services = cluster.services[name] || [ ];

        services.push(service.doc);

        cluster.services[name] = services;
      }

      callback(error, cluster.services);
    }
    else callback(null, cluster.services);
  }

  cluster.db.services.findAll({ }, { }, retrieved);
}


var KB = 1024;
var MB = KB * 1024;
var GB = MB * 1024;


if ( require.main === module ) {
  console.log('Testing Cluster at "' + __filename + '"...');

  var mongo = require('vs-mongo');

  var url = 'mongodb://localhost/sandbox';
  var config = { services  : { dropSync: false } }

  var db = mongo.connect(url, config);
  var cluster = new Cluster(db).cleanup(50);

  var test = function ( ) {
    cluster.retrieve(function ( error, value ) {
      if ( error ) return console.log(error);

      console.log('-  -  -');
      for ( var name in value ) {
        console.log(name + ' -> ' + value[name].length);
      }
      console.log('-  -  -');
    });
  }

  var done = function ( ) {
    clearInterval(interval);

    db.disconnect();
  }

  var interval = setInterval(test, 5);
  var timeout = setTimeout(done, 100);
}
