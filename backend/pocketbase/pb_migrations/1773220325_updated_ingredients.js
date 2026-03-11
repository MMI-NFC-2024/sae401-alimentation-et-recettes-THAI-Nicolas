/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3146854971")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number4001612985",
    "max": null,
    "min": null,
    "name": "kcal_100g",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number2033805164",
    "max": null,
    "min": null,
    "name": "proteines_100g",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3464470298",
    "max": null,
    "min": null,
    "name": "glucides_100g",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number2703994646",
    "max": null,
    "min": null,
    "name": "lipides_100g",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3146854971")

  // remove field
  collection.fields.removeById("number4001612985")

  // remove field
  collection.fields.removeById("number2033805164")

  // remove field
  collection.fields.removeById("number3464470298")

  // remove field
  collection.fields.removeById("number2703994646")

  return app.save(collection)
})
