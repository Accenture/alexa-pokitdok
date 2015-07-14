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
          "name": "address",
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
          "type": "LITERAL"
        }        
      ]
    },
    {
      "intent": "FindProvider",
      "slots": [
        {
          "name": "address",
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
          "type": "LITERAL"
        },
        {
          "name": "radius",
          "type": "NUMBER"
        },
        {
          "name": "specialty",
          "type": "LITERAL"
        }
      ]
    },
    {
      "intent": "HelpMe",
      "slots": []
    }
  ]
} 