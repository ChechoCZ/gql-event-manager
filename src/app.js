const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const Event = require('./app/models/event');

require('./database');

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
        events: async () => {
          const events = await Event.find();

          return events;
        },
        createEvent: async ({ eventInput }) => {
          const { title, description, price, date } = eventInput;

          const event = await Event.create({
            title,
            description,
            price: +price,
            date
          });

          return event;
        }
      },
      graphiql: true
    }));
  }
}

module.exports = new App().server;