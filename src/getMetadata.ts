import * as path from 'path';
import * as glob from 'fast-glob';
import findAndReadPackageJSON from 'find-and-read-package-json';

export interface Package {
  path: string;
  json: {[name: string]: any};
}

export interface Metadata {
  root: Package;
  workspaces: Package[];
}

async function getRootMetadata(cwd: string): Promise<Package> {
  const {file, json} = await findAndReadPackageJSON(cwd);
  return {
    path: path.dirname(file),
    json
  };
}

async function getWorkspaceMetadata(root: Package): Promise<Package[]> {
  const patterns = root.json.workspaces;

  if (!Array.isArray(patterns)) {
    return [];
  }

  const files = await glob<string>(
    patterns.map(pattern => `${pattern}/package.json`),
    {
      cwd: root.path,
      absolute: true
    }
  );

  return files.map(file => {
    return {
      path: path.dirname(file),
      json: require(file)
    }
  });
}

export async function getMetadata(cwd: string): Promise<Metadata> {
  const root = await getRootMetadata(cwd);
  const workspaces = await getWorkspaceMetadata(root);
  return {
    root,
    workspaces
  };
}
