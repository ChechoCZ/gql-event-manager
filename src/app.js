const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const events = [];

class App {
  constructor() {
    this.server = express();

    this.middleware();
  }

  middleware() {
    this.server.use(express.json());

    this.server.use('/graphql', graphqlHttp({
      schema: buildSchema(`
        type Event {
          _id: ID
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery {
          events: [Event!]!
        }

        type RootMutation {
          createEvent(eventInput: EventInput): Event
        }

        schema {
          query: RootQuery
          mutation: RootMutation
        }
      `),
      rootValue: {
        events: () => {
          return events;
        },
        createEvent: ({ eventInput }) => {
          const _id = Math.random().toString()
          const { title, description, price, date } = eventInput;

          const event = {
            _id,
            title,
            description,
            price: +price,
            date
          }

          events.push(event);

          return event;
        }
      },
      graphiql: true
    }));
  }
}

module.exports = new App().server;