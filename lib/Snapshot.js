var Snapshot = module.exports = function Snapshot ( service ) {
  service.db.snapshots.create(service.doc, this);

  this.doc.service = service.doc._id;
}
