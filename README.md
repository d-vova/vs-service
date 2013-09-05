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

Create service instance representing current application process

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


License
-------

MIT
