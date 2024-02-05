import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { db } from "@libs/database";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Config } from "src/config";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client(s3Config);

export const mutationResolvers = {
  Mutation: {
    createFolder: async (_, { name = "New Folder", parentFolderId = null }) => {
      try {
        const folderId = uuidv4();
        const response = await db
          .insertInto("system_image_folders")
          .values({
            id: folderId,
            name,
            parent_folder_id: parentFolderId,
            service_provider_id: process.env.SPID,
          })
          .returning(["id", "name", "parent_folder_id as parentFolderId"])
          .executeTakeFirst();
        return response;
      } catch (error) {
        console.error("Error creating folder", error);
        throw new Error("Error creating folder");
      }
    },
    deleteFolder: async (_, { folderId }) => {
      try {
        // Delete the folder from the database
        const response = await db
          .deleteFrom("system_image_folders")
          .where("id", "=", folderId)
          .where("service_provider_id", "=", process.env.SPID)
          .returning(["id"])
          .executeTakeFirst();

        // Check if the folder was found and deleted
        if (!response) {
          throw new Error("Folder not found");
        }

        // Return success response
        return {
          message: "Folder deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting folder", error);
        throw new Error(error);
      }
    },
    deleteImage: async (_, { imageId }) => {
      try {
        const image = await db
          .selectFrom("system_images")
          .select([
            "id",
            "label",
            "folder_id as folderId",
            "original_key as originalKey",
            "resized_key as resizedKey",
          ])
          .where("id", "=", imageId)
          .where("service_provider_id", "=", process.env.SPID)
          .executeTakeFirst();

        if (!image) {
          throw new Error("Image not found");
        }

        const deleteOrigObjectParams = {
          Bucket: process.env.BUCKET,
          Key: image.originalKey,
        };

        await s3Client.send(new DeleteObjectCommand(deleteOrigObjectParams));
        if (image.resizedKey) {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.BUCKET,
              Key: image.resizedKey,
            })
          );
        }

        await db
          .deleteFrom("system_images")
          .where("service_provider_id", "=", process.env.SPID)
          .where("id", "=", imageId)
          .execute();

        return { message: "Image deleted" };
      } catch (error) {
        console.error("Error deleting image", error);
        throw new Error(error);
      }
    },
    updateFolder: async (_, { folderId, name, parentFolderId }) => {
      try {
        const response = await db
          .updateTable("system_image_folders")
          .set({
            ...(name && { name }), // Update name if provided
            ...(parentFolderId !== undefined && {
              parent_folder_id: parentFolderId,
            }), // Update parent_folder_id if provided
          })
          .where("id", "=", folderId)
          .returning(["id", "name", "parent_folder_id as parentFolderId"])
          .executeTakeFirst();

        if (!response) {
          throw new Error("Folder not found");
        }

        return response;
      } catch (error) {
        console.error("Error updating folder", error);
        throw new Error(error);
      }
    },
    updateImage: async (_, { imageId, folderId, label }) => {
      try {
        if (!imageId) {
          throw new Error("Image id and folder id are required");
        }

        // Check if folderId is provided and valid
        if (folderId !== undefined && folderId !== null) {
          const folderExists = await db
            .selectFrom("system_image_folders")
            .select("id")
            .where("id", "=", folderId)
            .executeTakeFirst();

          if (!folderExists) {
            throw new Error("Folder id not found");
          }
        }

        const updateData = {
          ...(label !== undefined && { label }),
          ...(folderId !== undefined && { folder_id: folderId }),
        };

        const response = await db
          .updateTable("system_images")
          .set(updateData)
          .where("id", "=", imageId)
          .returning([
            "id",
            "label",
            "folder_id as folderId",
            "original_key as originalKey",
          ])
          .executeTakeFirst();

        if (!response) {
          throw new Error("Image not found");
        }

        return {
          image: response,
        };
      } catch (error) {
        console.error("Error updating image", error);
        throw new Error(error);
      }
    },
    generateUploadUrl: async (_, { filetype }) => {
      try {
        const serviceProviderId = process.env.SPID;
        const mimeType = `image/${filetype.toLowerCase()}`;
        const imageId = uuidv4();
        const key = `uploads/${serviceProviderId}/${imageId}/original.${filetype}`;
        const command = new PutObjectCommand({
          Bucket: process.env.BUCKET,
          Key: key,
          ContentType: mimeType,
          Metadata: {
            "image-id": imageId,
            "created-by": "53ced63c-1d62-4cb6-a29b-1f6da6923866",
            "service-provider-id": serviceProviderId,
          },
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 300,
        });
        return {
          imageId,
          uploadUrl,
        };
      } catch (error) {
        console.error("Error generating signed URL", error);
        throw new Error(error);
      }
    },
  },
};
