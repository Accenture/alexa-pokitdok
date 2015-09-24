{
  "intents": [
    {
      "intent": "AvailablePlans",
      "slots": [
        {
          "name": "state",
          "type": "LITERAL"
        },
        {
          "name": "planType",
          "type": "LITERAL"
        }
      ]
    },
    {
      "intent": "MyName",
      "slots": [
        {
          "name": "name",
          "type": "LITERAL"
        }
      ]
    },
    {
      "intent": "MyAddress",
      "slots": [
        {
          "name": "streetNumber",
          "type": "NUMBER"
        },
        {
          "name": "streetName",
          "type": "LITERAL"
        },
        {
          "name": "city",
          "type": "LITERAL"
        },
        {
          "name": "state",
          "type": "LITERAL"
        },
        {
          "name": "zipcode",
          "type": "NUMBER"
        }
      ]
    },
    {
      "intent": "FindProvider",
      "slots": [
        {
          "name": "radius",
          "type": "NUMBER"
        },
        {
          "name": "specialty",
          "type": "LITERAL"
        },
        {
          "name": "firstName",
          "type": "LITERAL"
        },
        {
          "name": "lastName",
          "type": "LITERAL"
        },
        {
          "name": "organizationName",
          "type": "LITERAL"
        }
      ]
    },
    {
      "intent": "HelpMe",
      "slots": []
    },
    {
      "intent": "Cancel",
      "slots": []
    }
  ]
} 