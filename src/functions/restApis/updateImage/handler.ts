import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { body } = event;
  const { pathParameters: { imageId = null } = {} } = event;
  const { folderId, label } = JSON.parse(body);

  // Validate imageId and folderId
  if (!imageId || !folderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Image id and folder id are required" }),
    };
  }

  try {
    // Check if the folderId is valid
    const folderExists = await db
      .selectFrom("system_image_folders")
      .select("id")
      .where("id", "=", folderId)
      .executeTakeFirst();

    if (!folderExists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Folder id not found" }),
      };
    }

    // Prepare the update object
    const updateData = {
      ...(label !== undefined && { label }),
      folder_id: folderId,
    };

    // Update the image's folder_id and label in the database
    const response = await db
      .updateTable("system_images")
      .set(updateData)
      .where("id", "=", imageId)
      .executeTakeFirst();

    // Check if the image was found and updated
    if (!response) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Image not found" }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image updated successfully",
        image: response,
      }),
    };
  } catch (error) {
    console.log("Error updating image", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error updating image" }),
    };
  }
};
