import * as path from 'path';
import * as webpack from 'webpack';
import { Metadata } from './getMetadata';
import { Compiler } from 'webpack';

// fix for webpack v4
declare module "webpack" {
  namespace loader {
    interface LoaderContext {
      rootContext: string;
    }
  }
}

export interface PluginOptions<M> {
  context?: string;
  module?: string;
  transform?: (this: webpack.loader.LoaderContext, metadata: Metadata) => Promise<M> | M;
  stringify?: (metadata: M) => Promise<string> | string;
}

export class Plugin<M = Metadata> {

  constructor(private options: PluginOptions<M> = {}) {
  }

  apply(compiler: webpack.Compiler) {
    const {
      context,
      module,
      transform,
      stringify
    } = this.options;

    // add the loader
    compiler.options.module = {
      ...compiler.options.module,
      rules: [
        ...(compiler.options.module ? compiler.options.module.rules : []),
        {
          test: /workspace-metadata-loader.txt$/,
          include: path.dirname(__dirname),
          loader: require.resolve('./loader'),
          options: {
            context,
            transform,
            stringify
          }
        }
      ]
    }
    
    // make a nice alias for the loader
    compiler.options.resolve = {
      ...compiler.options.resolve,
      alias: {
        ...(compiler.options.resolve ? compiler.options.resolve.alias : {}),
        [module || 'workspace-metadata']: require.resolve('./workspace-metadata-loader.txt')
      }
    }

  }

}