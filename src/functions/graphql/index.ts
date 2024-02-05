import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "/graphql",
      },
    },
    {
      http: {
        method: "post",
        path: "/graphql",
      },
    },
  ],
};
