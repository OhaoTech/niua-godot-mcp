import {
  persistJsonResult,
  resolveTreeMaxDepth,
  summarizeSceneTree
} from "../shared/payload-diet.js";

export async function getSceneTree({ client, payload = {} }) {
  const { savePath, maxDepth, ...request } = payload;
  const result = await client.getSceneTree({
    ...request,
    maxDepth: resolveTreeMaxDepth(maxDepth)
  });
  return persistJsonResult(result, savePath, summarizeSceneTree);
}
