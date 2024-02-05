import { gql } from "apollo-server-lambda";

export const queryType = gql`
  type Query {
    getChildrenFolders(folderId: String!): [Folder]
    getPaginatedImages(
      folderId: String
      page: Int
      pageSize: Int
    ): ImagePagination
    getImage(imageId: String!): ImageResponse
  }

  type ImagePagination {
    images: [Image]!
    page: Int!
    pageSize: Int!
  }

  type ImageResponse {
    image: Image
  }
`;
