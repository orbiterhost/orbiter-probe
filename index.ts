import { createPublicClient, http, parseAbiItem } from "viem";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const ABI: any[] = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "value", type: "string" },
    ],
    name: "MappingUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "getMapping",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "value", type: "string" }],
    name: "updateMapping",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export async function getAllContractEvents() {
  const client = createPublicClient({
    transport: http(RPC_URL),
  });

  try {
    const eventDefinitions = ABI.filter((item) => item.type === "event");

    if (eventDefinitions.length === 0) {
      throw new Error("No events found in the provided ABI");
    }

    const eventsByType: Record<string, any[]> = {};

    for (const eventDef of eventDefinitions) {
      if (!eventDef.name) continue;

      try {
        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS as `0x${string}`,
          event: eventDef,
          fromBlock: 0n,
          toBlock: "latest",
        });

        eventsByType[eventDef.name] = logs;

        console.log(`Found ${logs.length} events for ${eventDef.name}`);
      } catch (error) {
        console.error(`Error fetching events for ${eventDef.name}:`, error);
      }
    }

    return eventsByType;
  } catch (error) {
    console.error("Error fetching contract events:", error);
    throw error;
  }
}

async function downloadIPFSDirectory(
  cid: string,
  outputPath: string = "./"
): Promise<string> {
  if (!cid) {
    throw new Error("CID is required");
  }

  const url = `https://ipfs.io/ipfs/${cid}?download=true&format=tar&filename=${cid}.tar`;

  console.log(`Downloading IPFS directory with CID: ${cid}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to download: ${response.status} ${response.statusText}`
      );
    }

    const filePath = `${outputPath}/${cid}.tar`;
    await Bun.write(filePath, response);

    console.log(`Successfully downloaded to: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(
      `Error downloading IPFS directory: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
}

(async () => {
  try {
    const allEvents = await getAllContractEvents();

    // Access MappingUpdated events
    const mappingUpdatedEvents = allEvents.MappingUpdated || [];
    console.log(`Found ${mappingUpdatedEvents.length} MappingUpdated events`);

    // Get the latest mapping event to extract the most recent CID
    if (mappingUpdatedEvents.length > 0) {
      const latestEvent = mappingUpdatedEvents[mappingUpdatedEvents.length - 1];
      const latestCid = latestEvent.args.value;
      console.log("Latest mapping value:", latestCid);

      // Download the files
      await downloadIPFSDirectory(latestCid);
    }

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
