vs-service
==========

Tool for keeping track of service components in a cluster


Installation
------------

```
npm install vs-service
```


Quick Start
-----------

```javascript
var service = require('vs-service');

var url = 'mongodb://localhost/sandbox';

var name = 'Test';
var port = 8080;

var stun = { host: 'stun.l.google.com', port: 19302 }

var appsrvc = service.create(name, port, stun, url);
var cluster = service.cluster(url).refresh(100).cleanup(100);

appsrvc.heartbeat(100).snapshot(60000);
```


Service
-------

Create a service instance representing current application process

```javascript
var service = require('vs-service');

var url = 'mongodb://localhost/sandbox';

var name = 'Test';
var port = 8080;

var stun = { host: 'stun.l.google.com', port: 19302 }

var appsrvc = service.create(name, port, stun, url);
```

(It is important to point out that the database is expected to have `services` and `snapshots` collections already setup)


#### Discover ####

Update service document with the information about the system (os, platform, architecture, host, memory)

```javascript
appsrvc.discover();
```

Start discovery updates

```javascript
appsrvc.discover(60000);
```

Stop discovery updates

```javascript
appsrvc.discover(false);
```


#### Heartbeat ####

Update service document with a new heartbeat timestamp

```javascript
appsrvc.heartbeat();
```

Start heartbeat updates

```javascript
appsrvc.heartbeat(100);
```

Stop heartbeat updates

```javascript
appsrvc.heartbeat(false);
```


#### Snapshot ####

Update service document with the information about the state of the system (cpu, memory, uptime),
and add the document to the snapshot history collection

```javascript
appsrvc.snapshot();
```

Start snapshot updates

```javascript
appsrvc.snapshot(60000);
```

Stop snapshot updates

```javascript
appsrvc.snapshot(false);
```


Cluster
-------

Create a cluster instance used to access information about related services

```javascript
var service = require('vs-service');

var url = 'mongodb://localhost/sandbox';

var cluster = service.cluster(url);
```


#### Refresh ####

Setup minimum refresh interval to reduce the load on the database

```javascript
cluster.refresh(100);
```


#### Cleanup ####

Setup the period of time after which stale services with no heartbeat are eliminated

```javascript
cluster.cleanup((500);
```


#### Retrieve ####

Get all services from the database `services` collection

```javascript
cluster.retrieve(function ( error, value ) {
  if ( !error ) {
    for ( var name in value ) {
      console.log(name + ' service instances: ' + value[name].length);
    }
  }
  else console.log('An error occurred: ' + error);
});
```


#### Select One ####

Get a single instance of a service that matches required criteria best
(for now it automatically selects instance with the most amount of resources)

```javascript
cluster.selectOne('Test', function ( error, value ) {
  if ( !error ) {
    if ( !value ) {
      console.log('There is no instance available');
    }
    else {
      console.log('Best test service is running on ' + value.host);
    }
  }
  else console.log('An error occurred: ' + error);
});
```


#### Select All ####

Get all instances of a service

```javascript
cluster.selectAll('Test', function ( error, value ) {
  if ( !error ) {
    for ( var i = 0; i < value.length; i += 1 ) {
      console.log('Test service is running on ' + value[i].host);
    }
  }
  else console.log('An error occurred: ' + error);
});
```


License
-------

MIT
