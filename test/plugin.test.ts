import * as path from 'path';
import * as webpack from 'webpack';
import MemoryFS = require('memory-fs');
import {Plugin} from '../src';
import {project2Path, project3Path} from './fixtures';

// fix for webpack v4
declare module "webpack" {
  namespace loader {
    interface LoaderContext {
      rootContext: string;
    }
  }
}

function run(options: webpack.Configuration): Promise<webpack.Stats> {
  return new Promise((resolve, reject) => {
    const compiler = webpack(options);
    compiler.outputFileSystem = new MemoryFS() as any;
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      } else {
        expect(stats.compilation.errors).toHaveLength(0);
        expect(stats.compilation.assets['main.js'].source()).toContain('');
        resolve(stats);
      }
    });
  });
}

describe('plugin', () => {

  it('should contain metadata', async () => {
    
    const options = {
      context: `${project2Path}/website`,
      plugins: [
        new Plugin({
          context: project2Path
        })
      ]
    };

    const stats = await run(options);
    expect(stats.compilation.errors).toHaveLength(0);
    expect(stats.compilation.assets['main.js'].source()).toMatchSnapshot();

  });

  it('should contain transformed metadata', async () => {
    
    const options = {
      context: `${project2Path}/website`,
      plugins: [
        new Plugin({
          context: project2Path,
          transform: () => ({foo: 'bar'})
        })
      ]
    };

    const stats = await run(options);
    expect(stats.compilation.errors).toHaveLength(0);
    expect(stats.compilation.assets['main.js'].source()).toMatchSnapshot();

  });

  it('should contain stringified metadata', async () => {
    
    const options = {
      context: `${project2Path}/website`,
      plugins: [
        new Plugin({
          context: project2Path,
          stringify: () => `export default {load: () => ({foo: 'bar'})}`
        })
      ]
    };

    const stats = await run(options);
    expect(stats.compilation.errors).toHaveLength(0);
    expect(stats.compilation.assets['main.js'].source()).toMatchSnapshot();

  });

  it('should call transform with the loader context', async () => {
    
    const options = {
      context: `${project2Path}/website`,
      plugins: [
        new Plugin({
          context: project2Path,
          transform() {
            expect(this).toHaveProperty('addDependency', expect.any(Function));
            return {};
          }
        })
      ]
    };

    await run(options);

  });

  it('should use a different module name', async () => {
    
    const options = {
      context: `${project3Path}/website`,
      plugins: [
        new Plugin({
          module: 'metadata',
          context: project3Path
        })
      ]
    };

    await run(options);

  });

});
