import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { pathParameters: { folderId = null } = {} } = event;
  const { queryStringParameters } = event;
  const { page = "1", pageSize = "10" } = queryStringParameters || {};

  // Validate folderId
  if (!folderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Folder id is required" }),
    };
  }

  // Validate page and pageSize
  const pageNumber = parseInt(page, 10);
  const size = parseInt(pageSize, 10);
  if (isNaN(pageNumber) || isNaN(size) || pageNumber < 1 || size < 1) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid page or pageSize" }),
    };
  }

  try {
    // Fetch paginated images from the database
    const offset = (pageNumber - 1) * size;
    const images = await db
      .selectFrom("system_images")
      .selectAll()
      .where("folder_id", "=", folderId)
      .limit(size)
      .offset(offset)
      .execute();

    // Return success response with the paginated list of images
    return {
      statusCode: 200,
      body: JSON.stringify({ images, page: pageNumber, pageSize: size }),
    };
  } catch (error) {
    console.log("Error fetching images", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching images" }),
    };
  }
};
