#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3";
const USER_AGENT = "mcp-icd10/1.0.0";
const RATE_LIMIT_MS = 250;
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  lastRequestTime = Date.now();
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`ICD-10 API error: ${res.status}`);
  return res.json();
}

const server = new McpServer({ name: "mcp-icd10", version: "1.0.0" });

server.tool(
  "search_codes",
  "Search ICD-10-CM diagnosis codes by keyword or code prefix.",
  {
    query: z.string().describe("Search term (e.g. 'diabetes', 'fracture femur', 'E11')"),
    maxResults: z.number().min(1).max(500).default(20),
  },
  async ({ query, maxResults }) => {
    const params = new URLSearchParams({
      terms: query,
      maxList: String(maxResults),
      sf: "code,name",
      df: "code,name",
    });
    const data = await rateLimitedFetch(`${BASE}/search?${params}`);
    // Response: [totalCount, codes[], null, displayStrings[][]]
    const totalCount = data[0];
    const codes = data[1] || [];
    const details = data[3] || [];
    const results = codes.map((code: string, i: number) => ({
      code,
      description: details[i]?.[1] || details[i]?.[0] || "",
    }));
    return { content: [{ type: "text" as const, text: JSON.stringify({ totalCount, results }, null, 2) }] };
  }
);

server.tool(
  "get_code",
  "Get details for a specific ICD-10-CM code.",
  {
    code: z.string().describe("ICD-10-CM code (e.g. 'E11.9', 'J06.9', 'S72.001A')"),
  },
  async ({ code }) => {
    const params = new URLSearchParams({
      terms: code,
      maxList: "1",
      sf: "code",
      df: "code,name",
      ef: "code,name,parent_code,parent_name",
    });
    const data = await rateLimitedFetch(`${BASE}/search?${params}`);
    const extra = data[2] || {};
    return { content: [{ type: "text" as const, text: JSON.stringify({
      code: extra.code?.[0] || code,
      name: extra.name?.[0],
      parentCode: extra.parent_code?.[0],
      parentName: extra.parent_name?.[0],
    }, null, 2) }] };
  }
);

server.tool(
  "browse_chapter",
  "Browse ICD-10-CM codes by chapter/category prefix.",
  {
    prefix: z.string().describe("Code prefix (e.g. 'A' for infectious diseases, 'E10-E14' for diabetes, 'J' for respiratory)"),
    maxResults: z.number().min(1).max(500).default(50),
  },
  async ({ prefix, maxResults }) => {
    const params = new URLSearchParams({
      terms: prefix,
      maxList: String(maxResults),
      sf: "code",
      df: "code,name",
    });
    const data = await rateLimitedFetch(`${BASE}/search?${params}`);
    const codes = data[1] || [];
    const details = data[3] || [];
    const results = codes.map((code: string, i: number) => ({
      code,
      description: details[i]?.[1] || "",
    }));
    return { content: [{ type: "text" as const, text: JSON.stringify({ count: data[0], results }, null, 2) }] };
  }
);

server.tool(
  "list_chapters",
  "List ICD-10-CM top-level chapters and their code ranges.",
  {},
  async () => {
    const chapters = [
      { range: "A00-B99", name: "Certain infectious and parasitic diseases" },
      { range: "C00-D49", name: "Neoplasms" },
      { range: "D50-D89", name: "Diseases of the blood" },
      { range: "E00-E89", name: "Endocrine, nutritional and metabolic diseases" },
      { range: "F01-F99", name: "Mental, behavioral and neurodevelopmental disorders" },
      { range: "G00-G99", name: "Diseases of the nervous system" },
      { range: "H00-H59", name: "Diseases of the eye and adnexa" },
      { range: "H60-H95", name: "Diseases of the ear and mastoid process" },
      { range: "I00-I99", name: "Diseases of the circulatory system" },
      { range: "J00-J99", name: "Diseases of the respiratory system" },
      { range: "K00-K95", name: "Diseases of the digestive system" },
      { range: "L00-L99", name: "Diseases of the skin" },
      { range: "M00-M99", name: "Diseases of the musculoskeletal system" },
      { range: "N00-N99", name: "Diseases of the genitourinary system" },
      { range: "O00-O9A", name: "Pregnancy, childbirth and the puerperium" },
      { range: "P00-P96", name: "Conditions originating in the perinatal period" },
      { range: "Q00-Q99", name: "Congenital malformations" },
      { range: "R00-R99", name: "Symptoms, signs and abnormal clinical findings" },
      { range: "S00-T88", name: "Injury, poisoning and external causes" },
      { range: "V00-Y99", name: "External causes of morbidity" },
      { range: "Z00-Z99", name: "Factors influencing health status and contact with health services" },
    ];
    return { content: [{ type: "text" as const, text: JSON.stringify(chapters, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
