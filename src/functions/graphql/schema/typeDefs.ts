import { commonTypes } from "./types/commonTypes";
import { gql } from "apollo-server-lambda";
import { mutationType } from "./types/mutationType";
import { queryType } from "./types/queryType";

export const typeDefs = gql`
  ${commonTypes}
  ${queryType}
  ${mutationType}
`;
