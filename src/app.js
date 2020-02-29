const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const bcrypt = require('bcryptjs');

const Event = require('./app/models/event');
const User = require('./app/models/user');

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

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
          events: [Event!]!
        }

        type RootMutation {
          createEvent(eventInput: EventInput): Event
          createUser(userInput: UserInput): User
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
            date,
            creator: '5e5981af8078eec344a33c23'
          });

          const user = await User.findById('5e5981af8078eec344a33c23');

          if (!user) {
            return new Error('User not found!');
          }

          user.createdEvents.push(event);
          user.save();

          return event;
        },
        createUser: async({ userInput }) => {
          const { email, password } = userInput;

          const userExists = await User.findOne({ email });

          if (userExists) {
            return new Error('User already exists!');
          }

          const hashedPassword = await bcrypt.hash(password, 8);

          const user = await User.create({
            email,
            password: hashedPassword
          });

          user.password = null;

          return user;
        }
      },
      graphiql: true
    }));
  }
}

module.exports = new App().server;