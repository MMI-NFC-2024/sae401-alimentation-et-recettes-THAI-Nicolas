/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4237189171")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "updateRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4237189171")

  // update collection data
  unmarshal({
    "createRule": "recette.user = @request.auth.id",
    "deleteRule": "recette.user = @request.auth.id",
    "updateRule": "recette.user = @request.auth.id"
  }, collection)

  return app.save(collection)
})
