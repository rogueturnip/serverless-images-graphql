import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { v4 as uuidv4 } from "uuid";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { body } = event;
  const { name = "New Folder", parent_folder_id = null } =
    JSON.parse(body) || {};
  try {
    const folderId = uuidv4();
    const response = await db
      .insertInto("system_image_folders")
      .values({
        id: folderId,
        name,
        parent_folder_id,
        service_provider_id: process.env.SPID,
      })
      .returning(["id", "name", "parent_folder_id"])
      .executeTakeFirst();
    return {
      statusCode: 200,
      body: JSON.stringify({ ...response }),
    };
  } catch (error) {
    console.log("Error creating folder", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error creating folder" }),
    };
  }
};
