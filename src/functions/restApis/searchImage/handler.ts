import { APIGatewayEvent, APIGatewayProxyHandler } from "aws-lambda";

import { db } from "@libs/database";
import { sql } from "kysely";

export const main: APIGatewayProxyHandler = async (event: APIGatewayEvent) => {
  const { queryStringParameters: { query = "" } = {} } = event;

  // Validate the search query
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Search query is required" }),
    };
  }

  try {
    // Perform the search using ts_vector and ts_query
    const searchQuery = sql`to_tsquery(${query})`;
    const images = await db
      .selectFrom("system_images")
      .selectAll()
      // @ts-ignore
      .where(sql`to_tsvector('english', label) @@ ${searchQuery}`)
      .execute();

    // Return success response with search results
    return {
      statusCode: 200,
      body: JSON.stringify(images),
    };
  } catch (error) {
    console.log("Error in searching images", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error searching images" }),
    };
  }
};
