import { db } from "@libs/database";
import { sql } from "kysely";

export const queryResolvers = {
  Query: {
    getChildrenFolders: async (_, { folderId }) => {
      try {
        const childrenFolders = await db
          .selectFrom("system_image_folders")
          .select(["id", "name", "parent_folder_id as parentFolderId"])
          .where("parent_folder_id", "=", folderId)
          .execute();

        return childrenFolders;
      } catch (error) {
        console.error("Error fetching children folders", error);
        throw new Error(error);
      }
    },
    getPaginatedImages: async (
      _,
      { folderId = null, page = 1, pageSize = 10 }
    ) => {
      try {
        if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
          throw new Error("Invalid page or pageSize");
        }

        const offset = (page - 1) * pageSize;
        let query = db
          .selectFrom("system_images")
          .select([
            "id",
            "original_key as originalKey",
            "label",
            "folder_id as folderId",
            (eb) => {
              const image_url = eb.ref("service_provider_id")
                ? process.env.PRIVATE_IMAGES + "/"
                : process.env.PUBLIC_IMAGES + "/";
              const original_key = eb.ref("original_key");
              return sql<string>`CONCAT(${image_url}::text, ${original_key})`.as(
                "imageUrl"
              );
            },
          ])
          .limit(pageSize)
          .offset(offset);

        // Apply the where clause conditionally based on folderId
        if (folderId !== null) {
          query = query.where("folder_id", "=", folderId);
        } else {
          query = query.where("folder_id", "is", null);
        }

        const images = await query.execute();

        return {
          images: images,
          page: page,
          pageSize: pageSize,
        };
      } catch (error) {
        console.error("Error fetching images", error);
        throw new Error(error);
      }
    },
    getImage: async (_, { imageId }) => {
      try {
        const image = await db
          .selectFrom("system_images")
          .select([
            "id",
            "original_key as originalKey",
            "label",
            "folder_id as folderId",
            // Use sql`` to determine if it's a public or private image
            // to give the right url for it
            (eb) => {
              const image_url = eb.ref("service_provider_id")
                ? process.env.PRIVATE_IMAGES + "/"
                : process.env.PUBLIC_IMAGES + "/";
              const original_key = eb.ref("original_key");
              return sql<string>`CONCAT(${image_url}::text, ${original_key})`.as(
                "imageUrl"
              );
            },
          ])
          .where("id", "=", imageId)
          .executeTakeFirst();

        if (!image) {
          throw new Error("Image not found");
        }
        return image;
      } catch (error) {
        console.error("Error getting image URL", error);
        throw new Error(error);
      }
    },
  },
};
