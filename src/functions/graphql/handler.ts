import { ApolloServer } from "apollo-server-lambda";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

exports.main = server.createHandler();
