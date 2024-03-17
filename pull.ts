import { Octokit } from "npm:@octokit/rest";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

await config({ export: true });

const owner = "nbbaier";
const repo = "test-ground";
const head = "branch_1";
const base = "main";

const ghToken = Deno.env.get("GH_TOKEN");

const client = new Octokit({
  auth: ghToken,
});

// deno-lint-ignore no-unused-vars
const pullResult = await client.rest.pulls.create({
  owner,
  repo,
  head,
  base,
  title: "Amazing new feature",
  body: "Please pull these awesome changes in!",
});

const { data: refData } = await client.rest.git.getRef({
  owner,
  repo,
  ref: `heads/main`,
});

const result = await client.rest.git.createRef({
  owner,
  repo,
  ref: `refs/heads/branch_2`,
  sha: refData.object.sha,
});

console.log(result);
