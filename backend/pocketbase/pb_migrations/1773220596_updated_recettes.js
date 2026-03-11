/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2869346101")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "select1232983604",
    "maxSelect": 1,
    "name": "categorie",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Entrée",
      "Plat",
      "Dessert",
      "Boisson"
    ]
  }))

  // add field
  collection.fields.addAt(8, new Field({
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
      "Équilibre"
    ]
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number2663063708",
    "max": null,
    "min": null,
    "name": "kcal_portion",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "number762927009",
    "max": null,
    "min": null,
    "name": "total_proteines",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "number284076309",
    "max": null,
    "min": null,
    "name": "total_glucides",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "number725189329",
    "max": null,
    "min": null,
    "name": "total_lipides",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3292755704",
    "hidden": false,
    "id": "relation1232983604",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "regimes",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2869346101")

  // remove field
  collection.fields.removeById("select1232983604")

  // remove field
  collection.fields.removeById("select3256091567")

  // remove field
  collection.fields.removeById("number2663063708")

  // remove field
  collection.fields.removeById("number762927009")

  // remove field
  collection.fields.removeById("number284076309")

  // remove field
  collection.fields.removeById("number725189329")

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3292755704",
    "hidden": false,
    "id": "relation1232983604",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "categorie",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
