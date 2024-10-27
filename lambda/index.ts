import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import { createPublicClient, extractChain, http } from "viem";
import { base, baseSepolia, mainnet } from "viem/chains";
import { createSiweMessage, parseSiweMessage } from "viem/siwe";

const app = new Hono();

app.get("/", (c) => c.text("ping"));
app.post("/verify", async (c) => {
  try {
    const {
      statement,
      chainId,
      address,
      nonce,
      uri,
      domain,
      issuedAt,
      version,
      signature,
    } = await c.req.json();
    const chain = extractChain({
      id: chainId,
      chains: [base, baseSepolia, mainnet],
    });
    console.log(chain);
    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const siweMessage = createSiweMessage({
      address,
      chainId,
      statement,
      issuedAt: new Date(issuedAt),
      domain,
      nonce,
      uri,
      version,
    });

    console.log(siweMessage);
    const isValid = await publicClient.verifyMessage({
      address,
      message: siweMessage,
      signature,
    });

    return c.json({ success: isValid });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: (error as Error).message });
  }
});

// serve(app, (info) => {
//   console.log(`Listening on http://localhost:${info.port}`);
// });

export const handler = handle(app);
