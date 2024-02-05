import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { body } = event;
  const { pathParameters: { folderId = null } = {} } = event;
  const { name, parent_folder_id } = JSON.parse(body);

  try {
    // Update the folder details in the database
    const response = await db
      .updateTable("system_image_folders")
      .set({
        ...(name && { name }), // Update name if provided
        ...(parent_folder_id !== undefined && { parent_folder_id }), // Update parent_folder_id if provided
      })
      .where("id", "=", folderId)
      .returning(["id", "name", "parent_folder_id"])
      .executeTakeFirst();

    // Check if the folder was found and updated
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
        ...response,
      }),
    };
  } catch (error) {
    console.log("Error updating folder", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error updating folder" }),
    };
  }
};
