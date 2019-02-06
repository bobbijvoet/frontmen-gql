import { ApolloServer } from 'apollo-server'
import gql from 'graphql-tag'
import Auth from './auth'

const db = {
  agreements: [],
  holders: [
    {
      name: 'Bob',
      id: '1'
    },
    {
      name: 'Albert',
      id: '2'
    }
  ]
}

let idCounter = 0

const typeDefs = gql`
  directive @auth on FIELD_DEFINITION

  type Holder {
    id: ID
    name: String
    agreements: [Agreement]
  }

  type Agreement {
    id: ID
    balance: Float
    holder: Holder
    name: String
  }

  type Query {
    Agreements(id: ID): [Agreement]
  }

  input NewAgreementInput {
    holder: ID
    name: String
  }

  type Mutation {
    createAgreement(input: NewAgreementInput!): Agreement
  }
`

const resolvers = {
  Query: {
    Agreements(_, args) {
      if (args.id) {
        return [db.agreements.find(a => a.id === +args.id)]
      }
      return db.agreements
    }
  },

  Mutation: {
    createAgreement(_, { input }) {
      const agreement = {
        id: idCounter++,
        balance: 0,
        ...input
      }
      db.agreements.push(agreement)
      return agreement
    }
  },

  Agreement: {
    holder(agreement) {
      // console.log(JSON.stringify(agreement, null, 2))
      return db.holders.find(h => h.id === agreement.holder)
    }
  },

  Holder: {
    agreements(holder) {
      console.log(JSON.stringify(db, null, 2))
      return db.agreements.filter(a => a.holder === holder.id)
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    auth: {
      isAuth: true,
      holder: 2
    }
  }),
  schemaDirectives: {
    auth: Auth
  }
})
server
  .listen()
  .then(({ url }) => console.log(`listening on ${url}`))
  .catch(console.error.bind)
