/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2869346101")

  // remove field
  collection.fields.removeById("select2942972832")

  // remove field
  collection.fields.removeById("editor2296932267")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2869346101")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select2942972832",
    "maxSelect": 1,
    "name": "difficulte",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "facile",
      "moyen",
      "difficile"
    ]
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor2296932267",
    "maxSize": 0,
    "name": "conseils_coach",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  return app.save(collection)
})
