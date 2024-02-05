import { gql } from "apollo-server-lambda";

export const commonTypes = gql`
  type Response {
    success: Boolean!
    message: String
  }

  type Image {
    id: String!
    label: String
    originalKey: String!
    folderId: String
    imageUrl: String
  }

  type Folder {
    id: String!
    name: String!
    parentFolderId: String
  }

  enum FileType {
    jpg
    jpeg
    png
    gif
  }

  type S3FormField {
    key: String!
    value: String!
  }
`;
