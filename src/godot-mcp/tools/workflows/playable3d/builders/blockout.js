import { pickBridgeConnectionArgs, splitBridgeArgs } from "../../../../server/context.js";
import { runCreate3DPlayableBlockoutWorkflow } from "./blockout/workflow.js";

export async function create3DPlayableBlockout(args = {}) {
  const { client, payload } = splitBridgeArgs(args);
  return runCreate3DPlayableBlockoutWorkflow({
    client,
    payload,
    connectionArgs: pickBridgeConnectionArgs(args)
  });
}
