import { Octokit } from "npm:@octokit/rest";

export async function getLatestCommit(
  owner: string,
  repo: string,
  branch: string,
  client: Octokit
) {
  const { data: refData } = await client.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });

  return refData.object.sha;
}

export async function createNewTree(
  owner: string,
  repo: string,
  path: string,
  content: string,
  commitSHA: string,
  client: Octokit
) {
  const {
    data: { sha: currentTreeSHA },
  } = await client.rest.git.createTree({
    owner,
    repo,
    tree: [
      {
        path,
        content,
        mode: "100644",
        type: "commit",
      },
    ],
    base_tree: commitSHA,
    parents: [commitSHA],
  });
  return currentTreeSHA;
}

export async function createNewCommit(
  owner: string,
  repo: string,
  commitSHA: string,
  currentTreeSHA: string,
  message: string,
  client: Octokit
) {
  const {
    data: { sha: newCommitSHA },
  } = await client.rest.git.createCommit({
    owner,
    repo,
    tree: currentTreeSHA,
    message: message,
    parents: [commitSHA],
  });
  return newCommitSHA;
}

export async function updateBranchRef(
  owner: string,
  repo: string,
  newCommitSHA: string,
  branch: string = "main",
  client: Octokit
) {
  const result = await client.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitSHA,
  });
  return result;
}

export async function commitAndPush(
  owner: string,
  repo: string,
  path: string,
  content: string,
  ghToken: string,
  branch: string = "main",
  message: string = "auto generated commit"
) {
  const client = new Octokit({
    auth: ghToken,
  });
  const commitSHA = await getLatestCommit(owner, repo, branch, client);
  const currentTreeSHA = await createNewTree(
    owner,
    repo,
    path,
    content,
    commitSHA,
    client
  );
  const newCommitSHA = await createNewCommit(
    owner,
    repo,
    commitSHA,
    currentTreeSHA,
    message,
    client
  );
  const result = await updateBranchRef(
    owner,
    repo,
    newCommitSHA,
    branch,
    client
  );
  return result;
}
