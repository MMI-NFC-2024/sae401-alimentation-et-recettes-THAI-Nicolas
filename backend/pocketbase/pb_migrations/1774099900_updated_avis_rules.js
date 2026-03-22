/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_2828848192");

    unmarshal(
      {
        createRule:
          '@request.auth.id != "" && @request.body.user = @request.auth.id',
        deleteRule: "user = @request.auth.id",
        updateRule: "user = @request.auth.id",
      },
      collection,
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_2828848192");

    unmarshal(
      {
        createRule: "",
        deleteRule: "",
        updateRule: "",
      },
      collection,
    );

    return app.save(collection);
  },
);
