/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "recette.auteur = @request.auth.id",
    "deleteRule": "recette.auteur = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_2869346101",
        "hidden": false,
        "id": "relation1237017488",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "recette",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3146854971",
        "hidden": false,
        "id": "relation1806661744",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "ingredient",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
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
      },
      {
        "hidden": false,
        "id": "select493142296",
        "maxSelect": 1,
        "name": "unite",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "g",
          "kg",
          "ml",
          "cl",
          "L",
          "c. à soupe",
          "c. à café",
          "pincée",
          "filet",
          "pièce",
          "tranche",
          "feuille",
          "sachet",
          "bol",
          "cm",
          "gousse"
        ]
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_4237189171",
    "indexes": [],
    "listRule": "",
    "name": "composition",
    "system": false,
    "type": "base",
    "updateRule": "recette.auteur = @request.auth.id",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4237189171");

  return app.delete(collection);
})
