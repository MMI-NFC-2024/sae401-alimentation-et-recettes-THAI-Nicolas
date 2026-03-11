/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2869346101")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.body.user = @request.auth.id",
    "deleteRule": "user = @request.auth.id",
    "updateRule": "user = @request.auth.id"
  }, collection)

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation89829696",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2869346101")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.body.auteur = @request.auth.id",
    "deleteRule": "auteur = @request.auth.id",
    "updateRule": "auteur = @request.auth.id"
  }, collection)

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation89829696",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "auteur",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
