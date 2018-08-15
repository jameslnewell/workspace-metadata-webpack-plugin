# workspace-metadata-webpack-plugin

Display workspace metadata on your website.

If you're creating a website that showcases packages in a monorepo that uses `yarn workspaces`, this plugin will provide you with access to the workspace metadata.

## Installation

```bash
npm install workspace-metadata-webpack-plugin
```

## Usage

In a monorepo using yarn workspaces:

`package.json`
```json
{
  "name": "my-monorepo",
  "description": "This is my monorepo.",
  "workspaces": [
    "packages/*",
    "website"
  ]
}
```

`website/webpack.config.js`
```js
const Plugin = require('workspace-metadata-webpack-plugin').Plugin;

module.exports = {
  plugins: [
    new Plugin({
      context: path.join(__dirname, '..')
    })
  ]
};
```

`website/src/index.js`
```js
import metadata from 'workspace-metadata';

document.body.innerHTML = `
  <nav>

    <h1>${metadata.root.json.name}</h1>
    <p>${metadata.root.json.description}</p>

    ${metadata.workspaces.map(workspace => {
      const {name, version, description} = workspace.json;
      return `
        <div>
          <a href="/package/${name}/">
            ${name}
          </a>
          <small>@ ${version}</small>
          <br/>
          <p>${description}</p>
        </div>
      `;
    })}

  </nav>
`;

```

## API

```js
new Plugin(options)
```

### Options

#### module

> `string`

The name of the metadata module containing the metadata, used in the import/require statement. The default module name is `workspace-metadata`.

#### context

> `string`

The directory containing your root `package.json`. Defaults to webpack's `context`.

#### transform

> `(metadata: Metadata) => Promise<M> | M`

This function converts metadata into an alternate object. The default implementation returns the unmodified metadata. This conversion function can be useful for the following use cases:

- when you would like to only include a subset of the metadata in your bundle in order to reduce bundle size
- when you would like to include additional metadata from outside of the `package.json`
- when you would like to filter which packages are included in the metadata

For example:
```js
const glob = require('fast-glob');
const stringifyRequest = require('loader-utils').stringifyRequest;

const transform = async (metadata) => {

  // only include a subset of the metadata from the root package.json
  const root = {
    name: metadata.json.name,
    description: metadata.json.description,
  }

  let workspaces = metadata.workspaces;

  // only include a subset of the workspaces
  workspaces = workspaces.filter(workspace => !workspace.json.private);

  // add a list of demo file paths that exist in the workspace
  workspaces = await Promise.all(metadata.workspaces.map(async (workspace) => {
    return {
      ...workspace,
      demos: await glob('src/**/*.demo.js', {
        cwd: workspace.path,
        absolute: true
      })
    }
  }));
  
  // only include a subset of the metadata from the workspace package.json
  workspaces = metadata.workspaces.map(workspace => {
    return {
      name: workspace.json.name,
      version: workspace.json.version,
      description: workspace.json.name,
      demos: workspace.demos
    };
  }));

  return {
    root,
    workspaces
  };
};
```

#### stringify

> `(metadata: M) => Promise<string> | string`

This function converts metadata into a string of JavaScript source code. The default implementation uses `JSON.stringify()` but there may be times when you would like to provide a custom conversion function.

For example:

> Import a workspace file so you can dynamically show a demo 

```js
function stringify(metadata) {
  return `export default {
    workspaces: [${metadata.workspaces.map(workspace => (`{
      name: '${workspace.json.name}',
      demo: () => import(${stringifyRequest(this, `${workspace.path}/src/index.demo.js`)})
    }`))}]
  }`;
}
```