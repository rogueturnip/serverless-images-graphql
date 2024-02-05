import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { folderId = null } = {} } = event;

  try {
    // Fetch children folders from the database
    const childrenFolders = await db
      .selectFrom("system_image_folders")
      .select(["id", "name", "parent_folder_id"])
      .where("parent_folder_id", "=", folderId)
      .execute();

    // Check if children folders were found
    if (!childrenFolders || childrenFolders.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No children folders found" }),
      };
    }

    // Return success response with the list of children folders
    return {
      statusCode: 200,
      body: JSON.stringify(childrenFolders),
    };
  } catch (error) {
    console.log("Error fetching children folders", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching children folders" }),
    };
  }
};
