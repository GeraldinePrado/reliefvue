import type { DatabaseSync } from "node:sqlite";
import { HttpError } from "./http.ts";
import {
  ledgerSummary,
  partnerActivations,
  partnerCoverage,
  partnerSnapshot,
} from "./service.ts";

/**
 * A deliberately read-only MCP surface for partner organisations (NGOs,
 * community groups, government desks). It exposes activation, coverage and
 * ledger facts; it cannot move money or mutate a household record. Auth is a
 * scoped partner API key passed as an HTTP bearer token.
 */

export const MCP_PROTOCOL_VERSION = "2026-07-28";
export const MCP_SUPPORTED_VERSIONS = ["2026-07-28", "2025-06-18"] as const;

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "list_activations",
    description:
      "List disaster activations for the partner organisation with budget, paid and remaining amounts. Use this first to find an activation id.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_activation_coverage",
    description:
      "Return district-level coverage for one activation: applications, approved, paid, and which districts have not received any payout yet.",
    inputSchema: {
      type: "object",
      properties: { activation_id: { type: "string", description: "Activation id from list_activations." } },
      required: ["activation_id"],
      additionalProperties: false,
    },
  },
  {
    name: "list_unreached_districts",
    description:
      "List districts inside active responses where no household has received a payout yet. Useful for finding unreachable or under-served areas.",
    inputSchema: {
      type: "object",
      properties: { activation_id: { type: "string", description: "Optional activation id to narrow the search." } },
      additionalProperties: false,
    },
  },
  {
    name: "get_ledger_summary",
    description:
      "Return public-safe ledger totals: donations, paid relief, pending signatures, reserve, households paid and active responses.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

function text(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function toolResult(value: unknown): Record<string, unknown> {
  return {
    content: [{ type: "text", text: text(value) }],
    structuredContent: value,
    isError: false,
  };
}

export function callTool(db: DatabaseSync, orgId: string, name: string, args: Record<string, unknown>): unknown {
  if (name === "list_activations") {
    return { activations: partnerActivations(db, orgId) };
  }
  if (name === "get_activation_coverage") {
    const activationId = args.activation_id;
    if (typeof activationId !== "string" || activationId.length === 0) {
      throw new HttpError(400, "activation_id is required.", "invalid_tool_arguments");
    }
    return partnerCoverage(db, orgId, activationId);
  }
  if (name === "list_unreached_districts") {
    const filter = typeof args.activation_id === "string" ? args.activation_id : null;
    const snapshot = partnerSnapshot(db, orgId);
    const rows = snapshot.coverage.filter((row) => row.unreached && (!filter || row.activationId === filter));
    return {
      region: snapshot.organisation,
      unreached: rows.map((row) => ({
        activationId: row.activationId,
        activationTitle: row.activationTitle,
        province: row.province,
        district: row.district,
        applications: row.applications,
      })),
      note: rows.length === 0 ? "Every listed district has at least one paid household." : undefined,
    };
  }
  if (name === "get_ledger_summary") {
    const ledger = ledgerSummary(db, orgId);
    return { totals: ledger.totals, byProvince: ledger.byProvince, demoRates: ledger.demoRates };
  }
  throw new HttpError(400, `Unknown tool: ${name}`, "unknown_tool");
}

export interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

export function handleMcp(db: DatabaseSync, orgId: string, request: JsonRpcRequest): unknown {
  const hasId = request.id !== undefined && request.id !== null;
  if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    return { jsonrpc: "2.0", id: request.id ?? null, error: { code: -32600, message: "Invalid JSON-RPC request." } };
  }
  try {
    switch (request.method) {
      case "initialize": {
        const requested = request.params?.protocolVersion;
        const negotiated =
          typeof requested === "string" && (MCP_SUPPORTED_VERSIONS as readonly string[]).includes(requested)
            ? requested
            : MCP_PROTOCOL_VERSION;
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: negotiated,
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: "reliefvue-operations", version: "0.1.0" },
            instructions:
              "Read-only disaster-relief operations data for a partner organisation. Money movement and household records are not exposed through MCP.",
          },
        };
      }
      case "ping":
        return { jsonrpc: "2.0", id: request.id, result: {} };
      case "tools/list":
        return { jsonrpc: "2.0", id: request.id, result: { tools: MCP_TOOLS } };
      case "tools/call": {
        const name = request.params?.name;
        if (typeof name !== "string") {
          return {
            jsonrpc: "2.0",
            id: request.id,
            error: { code: -32602, message: "tools/call requires params.name." },
          };
        }
        const rawArgs = request.params?.arguments;
        const args = rawArgs !== null && typeof rawArgs === "object" && !Array.isArray(rawArgs) ? (rawArgs as Record<string, unknown>) : {};
        const value = callTool(db, orgId, name, args);
        return { jsonrpc: "2.0", id: request.id, result: toolResult(value) };
      }
      default:
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: { code: -32601, message: `Method not found: ${request.method}` },
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool call failed.";
    const code = error instanceof HttpError && error.status === 404 ? -32004 : -32603;
    if (!hasId) return { jsonrpc: "2.0", id: null, error: { code, message } };
    return { jsonrpc: "2.0", id: request.id, error: { code, message } };
  }
}
