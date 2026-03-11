/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4237189171")

  // remove field
  collection.fields.removeById("text2347911801")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number2347911801",
    "max": null,
    "min": null,
    "name": "quantite",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4237189171")

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2347911801",
    "max": 0,
    "min": 0,
    "name": "quantite",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("number2347911801")

  return app.save(collection)
})
