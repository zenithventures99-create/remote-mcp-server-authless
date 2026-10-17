
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

function createServer() {
  const server = new McpServer({
    name: "Gurbani Search",
    version: "1.0.0",
  });

  // Search Gurbani using the GurbaniNow API
  server.registerTool(
    "search_gurbani",
    {
      description:
        "Search GurbaniNow for Gurbani verses, phrases, or keywords.",
      inputSchema: z.object({
        query: z.string().min(1).describe(
          "Gurbani text, phrase, or keyword to search"
        ),
      }),
    },
    async ({ query }) => {
      try {
        const url =
          "https://api.gurbaninow.com/v2/search/" +
          encodeURIComponent(query) +
          "?searchtype=0";

        const response = await fetch(url);

        if (!response.ok) {
          return {
            content: [{
              type: "text",
              text: `GurbaniNow returned HTTP ${response.status}.`,
            }],
          };
        }

        const data: unknown = await response.json();

        return {
          content: [{
            type: "text",
            text: JSON.stringify(data),
          }],
        };
      } catch {
        return {
          content: [{
            type: "text",
            text: "Gurbani search failed. Please try again.",
          }],
        };
      }
    }
  );

  // Calculator: addition
  server.registerTool(
    "add",
    {
      description: "Add two numbers.",
      inputSchema: z.object({
        a: z.number(),
        b: z.number(),
      }),
    },
    async ({ a, b }) => ({
      content: [{ type: "text", text: String(a + b) }],
    })
  );

  // Calculator: arithmetic operations
  server.registerTool(
    "calculate",
    {
      description: "Calculate using basic arithmetic.",
      inputSchema: z.object({
        operation: z.enum([
          "add",
          "subtract",
          "multiply",
          "divide",
        ]),
        a: z.number(),
        b: z.number(),
      }),
    },
    async ({ operation, a, b }) => {
      if (operation === "divide" && b === 0) {
        return {
          content: [{
            type: "text",
            text: "Error: Cannot divide by zero.",
          }],
        };
      }

      let result: number;

      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          result = a / b;
          break;
      }

      return {
        content: [{ type: "text", text: String(result) }],
      };
    }
  );

  return server;
}

const handler = createMcpHandler(createServer);

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
