import { ApolloServer } from 'apollo-server'
import gql from 'graphql-tag'
import Auth from './auth'
import fetch from 'node-fetch'

type Agreement = {
  id: string
  balance: number
  name: string

  holder?: Holder
}

type Holder = {
  id: string
  name: string

  agreements?: Agreement[]
}

const db: { agreements: Agreement[]; holders: Holder[] } = {
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
  directive @auth on FIELD_DEFINITION | MUTATION

  type Holder {
    id: ID
    name: String
    posts: [Post]

    agreements: [Agreement]
  }

  type Post {
    title: String
    author: String
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
    createAgreement(input: NewAgreementInput!): Agreement @auth
  }
`

const resolvers = {
  Query: {
    Agreements(_, args) {
      if (args.id) {
        return [db.agreements.find(a => parseInt(a.id) === parseInt(args.id))]
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
      return db.holders.find(h => h.id === agreement.holder)
    }
  },

  Holder: {
    agreements(holder) {
      return db.agreements.filter(a => a.holder === holder.id)
    },
    posts() {
      return fetch('http://reddit.com/.json')
        .then(x => x.json())
        .then(x => x.data.children.map(y => y.data))
    }
  }
}

const server = new ApolloServer({
  tracing: true,
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
