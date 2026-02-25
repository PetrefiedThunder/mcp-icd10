# mcp-icd10

Search and browse ICD-10 diagnosis codes via the NLM Clinical Tables API.

> **Free API** — No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_codes` | Search ICD-10-CM diagnosis codes by keyword or code prefix. |
| `get_code` | Get details for a specific ICD-10-CM code. |
| `browse_chapter` | Browse ICD-10-CM codes by chapter/category prefix. |
| `list_chapters` | List ICD-10-CM top-level chapters and their code ranges. |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-icd10.git
cd mcp-icd10
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

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

## Usage with npx

```bash
npx mcp-icd10
```

## License

MIT
