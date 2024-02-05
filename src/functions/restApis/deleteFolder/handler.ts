import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { folderId = null } = {} } = event;

  try {
    // Delete the folder from the database
    const response = await db
      .deleteFrom("system_image_folders")
      .where("id", "=", folderId)
      .executeTakeFirst();

    // Check if the folder was found and deleted
    if (!response) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Folder not found" }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Folder deleted successfully",
      }),
    };
  } catch (error) {
    console.log("Error deleting folder", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error deleting folder" }),
    };
  }
};
