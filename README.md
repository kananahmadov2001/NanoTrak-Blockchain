# NanoTrak-Blockchain

## Idea
The idea is to take a scan data from the spreadsheet (CSV) and turn each row into a structured JSON, generate a cryptographic hash for that record, and store that hash on a blockchain. We to make the scan records like if someone changes the scan data later, the hash changes, and verification will fail.

---

## What blockchain are we using?
For the MVP, the idea is using Hardhat; because it runs a local blockchain on your computer so development is free and fast. Later, the same idea can be deployed to a real chain (maybe Polygon or Ethereum), but this repo focuses on the local prototype first.

---

## What the given data will look like
The input data is a spreadsheet where each row contains:
- scan info (instrument serial number, reading number, date/time, method, etc.)
- element concentration values (Ti, V, Cr, Mn, Fe, …)
- error values for each element (Error1s)
- extra metadata (best match, customer, operator, component, etc.)
---

## The main idea for the development
1. Treat each row in the spreadsheet as one scan record (one event).
2. Convert each row into a JSON record (**canonical JSON**).
3. Generate one SHA-256 hash per JSON record (**1 row -> 1 JSON -> 1 hash**)
4. Store only:
   - `scan_id`
   - `timestamp`
   - `hash`
   on the blockchain.
5. Verification later is:
   - re-create the JSON
   - re-hash it
   - compare it with the hash stored on-chain
---

## How `scan_id` is created
Each scan record gets a unique ID:
<InstrumentSerial>-<Reading#>-<ISO timestamp>
Example: 846430-1-2025-08-26T14:26:32Z

---

## JSON format (example)
Each spreadsheet row becomes a JSON object like:

```json
{
  "scan_id": "846430-1-2025-08-26T14:26:32Z",
  "instrument_serial": "846430",
  "reading_number": 1,
  "timestamp": "2025-08-26T14:26:32Z",
  "units": "%",
  "metadata": {
    "customer": "alera",
    "operator": "cheyenne",
    "component": "Pipe",
    "quality": "Accept"
  },
  "elements": {
    "Ti": { "concentration": "<LOD", "error_1s": 0.28708 },
    "Fe": { "concentration": 91.63089, "error_1s": 0.54475 }
  }
}
