## Orbiter Probe

Orbiter is a website/web app hosting platform that is both open source and uses technologies that prevent vendor lock-in. To prove this, this tool allows you to ["credibly exit"](https://newsletter.squishy.computer/p/credible-exit) from Orbiter without needing to use any Orbiter APIs or requesting permission from Orbiter. 

It will extract the most recent version of your site and download it to your computer. 

### Requirements

To use this tool, you will need the following: 

1. Your site's smart contract address. To find and use this value, take these steps: 
    - Log into Orbiter, click the gear icon next to your site's name, then click the info button. You'll see a modal with the "Contract Address". 
    - In this tool's project folder, create a `.env.local` file and add: `CONTRACT_ADDRESS=YOUR CONTRACT ADDRESS VALUE`
2. A Base RPC URL. You can get this from a few different free services: 
    - [Alchemy](https://alchemy.com)
    - [QuickNode](https://quicknode.com)

### How to use

Using the tool is as simple as following these steps: 

1. Install Bun by following this guide. 
2. Clone the repository: `git clone orbiter-probe`
3. Change into the directory & install dependencies: `cd orbiter-probe && bun`
4. Add a `.env.local` file with the `CONTRACT_ADDRESS` value as explained above and a `RPC_URL` value retrieved from the RPC provider you chose
5. Run `bun run index.ts`

This will look through your site's contract events to find the most recent update to your site. It will then use a public IPFS gateway to fetch the directory of files and download it as a `.tar` file. You can then extract the `.tar` file and you will have the full site directory. 

