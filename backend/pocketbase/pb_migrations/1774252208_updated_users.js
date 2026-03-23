/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select3256091567",
    "maxSelect": 1,
    "name": "objectif_sante",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Prise de masse",
      "Perte de poids",
      "Se maintenir"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select3256091567")

  return app.save(collection)
})
