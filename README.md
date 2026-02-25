# mcp-icd10

MCP server for ICD-10-CM diagnosis code lookup via NLM Clinical Tables API. No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_codes` | Search codes by keyword or prefix |
| `get_code` | Get details for a specific code |
| `browse_chapter` | Browse codes by chapter/category |
| `list_chapters` | List all 21 ICD-10-CM chapters |

## Install

```bash
npm install && npm run build
```

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "icd10": {
      "command": "node",
      "args": ["/path/to/mcp-icd10/dist/index.js"]
    }
  }
}
```

## License

MIT
