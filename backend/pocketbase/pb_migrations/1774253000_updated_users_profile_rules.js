/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_");

    // keep list private while allowing direct public profile view by id
    unmarshal(
      {
        listRule: "id = @request.auth.id",
        viewRule: "",
      },
      collection,
    );

    // add field
    collection.fields.addAt(
      11,
      new Field({
        hidden: false,
        id: "select4183390721",
        maxSelect: 1,
        name: "objectif_sante",
        presentable: true,
        required: false,
        system: false,
        type: "select",
        values: ["Prise de masse", "Perte de poids", "Équilibre"],
      }),
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_");

    // rollback field
    collection.fields.removeById("select4183390721");

    // rollback rules to previous open state
    unmarshal(
      {
        listRule: "",
        viewRule: "",
      },
      collection,
    );

    return app.save(collection);
  },
);
