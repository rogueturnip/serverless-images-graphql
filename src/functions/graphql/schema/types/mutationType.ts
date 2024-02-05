import { gql } from "apollo-server-lambda";

export const mutationType = gql`
  type Mutation {
    createFolder(name: String, parentFolderId: String): FolderResponse
    deleteFolder(folderId: String!): DeleteFolderResponse
    deleteImage(imageId: String!): DeleteImageResponse
    updateFolder(
      folderId: String!
      name: String
      parentFolderId: String
    ): FolderResponse
    updateImage(
      imageId: String!
      folderId: String
      label: String
    ): ImageUpdateResponse
    generateUploadUrl(filetype: FileType!): GenerateUploadUrlResponse
  }

  type FolderResponse {
    id: String!
    name: String!
    parentFolderId: String
  }

  type DeleteFolderResponse {
    message: String!
  }

  type DeleteImageResponse {
    message: String!
  }

  type ImageUpdateResponse {
    image: Image
  }

  type UploadUrlResponse {
    uploadUrl: String!
    imageId: String!
  }

  type GenerateUploadUrlResponse {
    imageId: String!
    uploadUrl: String!
  }
`;
