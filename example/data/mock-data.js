export default {
  "gifts/:id?": {
    get(query, param) {

      if (param.id) {
        return         {
          "id": param.id,
          "name": "Gift 1"
        };
      }

      return [
        {
          "id": 1,
          "name": "Gift 1"
        },
        {
          "id": 2,
          "name": "Gift 2"
        }
      ];
    },
    "post": {
      "name": "$$name$$"
    },
    "put": {
      "id": 3
    },
    "error": {
      "error": true
    }
  }
};
