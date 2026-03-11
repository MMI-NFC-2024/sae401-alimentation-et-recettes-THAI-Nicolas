/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3146854971")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select1232983604",
    "maxSelect": 1,
    "name": "categorie",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Légumes & Fruits",
      "Viandes & Volailles",
      "Poissons & Crustacés",
      "Produits laitiers",
      "Protéines Végétales",
      "Légumineuses",
      "Féculents & Céréales",
      "Oléagineux & Graines",
      "Matières grasses",
      "Condiments & Epices",
      "Autres"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3146854971")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "select1232983604",
    "maxSelect": 1,
    "name": "categorie",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Protéines",
      "Légumes & Fruits",
      "Féculents & Grains",
      "Condiments & Autres",
      "Matières grasses"
    ]
  }))

  return app.save(collection)
})
