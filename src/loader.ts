import * as webpack from 'webpack';
import * as loaderUtils from 'loader-utils';
import * as validateOptions from 'schema-utils';
import { Metadata, getMetadata } from './getMetadata';

const schema = {
  type: 'object',
  properties: {
    context: {
      type: 'string'
    },
    transform: {
      instanceof: 'Function'
    },
    stringify: {
      instanceof: 'Function'
    }
  }
};

function defaultTransform<M>(metadata: Metadata) {
  return metadata as any;
}

function defaultStringify<M>(metadata: M) {
  return `export default ${JSON.stringify(metadata)}`;
}

function getDependencies(metadata: Metadata) {
  const {root, workspaces} = metadata;
  return [
    `${root.path}/package.json`,
    ...workspaces.map(workspace => `${workspace.path}/package.json`)
  ];
}

export default async function(this: webpack.loader.LoaderContext, source: string) {
  const callback = this.async();
  try {

    // check the options
    const options = loaderUtils.getOptions(this) || {};
    validateOptions(schema, options, 'workspace-metadata loader');

    // get the default options
    const {
      context = this.rootContext, 
      transform = defaultTransform, 
      stringify = defaultStringify
    } = options;

    // get the metadata
    let metadata = await getMetadata(context);
    
    // change paths to relative ones since absolute ones break the hashing - use `stringifyRequest`
    // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
    metadata.root.path = loaderUtils.stringifyRequest(this, metadata.root.path);
    metadata.workspaces = metadata.workspaces.map(workspace => ({
      ...workspace,
      path: loaderUtils.stringifyRequest(this, workspace.path)
    }));

    // the output can be cached
    this.cacheable(true);

    // list any files we use so that webpack rebundles when they change
    getDependencies(metadata).forEach(dependency => {
      this.addDependency(dependency);
    });

    // transform the metadata
    if (transform) {
      metadata = await transform.call(this, metadata);
    }

    // convert the metadata to a string
    const output = await stringify.call(this, metadata);

    if (callback) {
      callback(null, output);
    }
  } catch (error) {
    if (callback) {
      callback(error);
    }
  }
}
