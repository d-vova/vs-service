var os = require('os');
var stun = require('vs-stun');
var Snapshot = require('./Snapshot');


var Service = module.exports = function Service ( name, port, stun, db ) {
  var doc = { name: name, port: port }

  this.db = db;
  this.stun = stun;
  this.timer = { }

  db.services.create(doc, this);

  this.discover();
  this.heartbeat();
  this.snapshot();
}


Service.prototype.discover = function discover ( interval ) {
  var self = this;

  if ( interval === false || interval > 0 ) {
    if ( this.timer.discover ) clearInterval(this.timer.discover);
  }

  if ( interval > 0 ) {
    var fn = function fn ( ) { Service.discover(self); }

    this.timer.discover = setInterval(fn, interval);
  }
  else Service.discover(this);

  return this;
}

Service.prototype.heartbeat = function heartbeat ( interval ) {
  var self = this;

  if ( interval === false || interval > 0 ) {
    if ( this.timer.heartbeat ) clearInterval(this.timer.heartbeat);
  }

  if ( interval > 0 ) {
    var fn = function fn ( ) { Service.heartbeat(self); }

    this.timer.heartbeat = setInterval(fn, interval);
  }
  else Service.heartbeat(this);

  return this;
}

Service.prototype.snapshot = function snapshot ( interval ) {
  var self = this;

  if ( interval === false || interval > 0 ) {
    if ( this.timer.snapshot ) clearInterval(this.timer.snapshot);
  }

  if ( interval > 0 ) {
    var fn = function fn ( ) { Service.snapshot(self); }

    this.timer.snapshot = setInterval(fn, interval);
  }
  else Service.snapshot(this);

  return this;
}


Service.discover = function discover ( service ) {
  var socket, server = service.stun;

  var callback = function callback ( error, value ) {
    socket = value;

    if ( socket && socket.stun ) {
      service.doc.host = socket.stun.public.host;
    }

    service.doc.info = {
      os       : os.type(),
      platform : os.platform(),
      arch     : os.arch(),
      memory   : os.totalmem()
    }

    service.save();

    if ( socket ) socket.close();
  }
  
  stun.connect(server, callback);
}

Service.heartbeat = function heartbeat ( service ) {
  service.doc.heartbeat = new Date().getTime();

  service.save();
}

Service.snapshot = function snapshot ( service ) {
  var total = 0, cpus = os.cpus();

  var done = function done ( ) {
    service.doc.load = os.loadavg();
    service.doc.cpus = os.cpus();
    service.doc.uptime = os.uptime();

    service.doc.mem = {
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    }

    service.doc.cpu = { user: 0, nice: 0, idle: 0, sys: 0, irq: 0 }

    for ( var i = 0; i < cpus.length; i += 1 ) {
      service.doc.cpu.user += service.doc.cpus[i].times.user - cpus[i].times.user;
      service.doc.cpu.nice += service.doc.cpus[i].times.nice - cpus[i].times.nice;
      service.doc.cpu.idle += service.doc.cpus[i].times.idle - cpus[i].times.idle;
      service.doc.cpu.sys += service.doc.cpus[i].times.sys - cpus[i].times.sys;
      service.doc.cpu.irq += service.doc.cpus[i].times.irq - cpus[i].times.irq;
    }

    total += service.doc.cpu.user;
    total += service.doc.cpu.nice;
    total += service.doc.cpu.idle;
    total += service.doc.cpu.sys;
    total += service.doc.cpu.irq;

    service.doc.cpu.user = (1000 * service.doc.cpu.user / total | 0) / 10;
    service.doc.cpu.nice = (1000 * service.doc.cpu.nice / total | 0) / 10;
    service.doc.cpu.idle = (1000 * service.doc.cpu.idle / total | 0) / 10;
    service.doc.cpu.sys = (1000 * service.doc.cpu.sys / total | 0) / 10;
    service.doc.cpu.irq = (1000 * service.doc.cpu.irq / total | 0) / 10;

    service.doc.process = {
      pid: process.pid,
      mem: process.memoryUsage()
    }

    service.save();

    new Snapshot(service).save();
  }

  setTimeout(done, 1000);
}


if ( require.main === module ) {
  console.log('Testing Service at "' + __filename + '"...');

  var mongo = require('vs-mongo');

  var name = 'test', port = 0;
  var server = { host: 'stun.l.google.com', port: 19302 }
  var url = 'mongodb://localhost/sandbox';

  var config = {
    services  : { dropSync: false },
    snapshots : { dropSync: false }
  }

  var db = mongo.connect(url, config);
  var service = new Service(name, port, server, db);

  setTimeout(function ( ) {
    console.log(service.doc);

    db.disconnect();
  }, 1000);
}
