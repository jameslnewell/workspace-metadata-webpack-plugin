import * as path from 'path';
import {getMetadata} from '../src/getMetadata';

const fixture1Path = path.join(__dirname, '..', 'test', '__fixtures__', 'project-1');
const fixture2Path = path.join(__dirname, '..', 'test', '__fixtures__', 'project-2');

describe('getMetadata()', () => {
  it('should return metadata from this package', async () => {
    const metadata = await getMetadata(process.cwd());
    expect(metadata).toEqual({
      root: {
        path: path.join(__dirname, '..'),
        json: expect.objectContaining({

        })
      },
      workspaces: []
    });
  });
  it('should return metadata from project-1', async () => {
    const metadata = await getMetadata(fixture1Path);
    expect(metadata).toEqual({
      root: {
        path: fixture1Path,
        json: {
          name: 'project-1',
          workspaces: [
            "packages/*"
          ]
        } 
      },
      workspaces: expect.arrayContaining([
        {
          path: `${fixture1Path}/packages/workspace-1`,
          json: {
            name: 'workspace-1'
          }
        },
        {
          path: `${fixture1Path}/packages/workspace-2`,
          json: {
            name: 'workspace-2'
          }
        },
        {
          path: `${fixture1Path}/packages/workspace-3`,
          json: {
            name: 'workspace-3'
          }
        }
      ])
    });
  });
  it('should return metadata from project-2', async () => {
    const metadata = await getMetadata(fixture2Path);
    expect(metadata).toEqual({
      root: {
        path: fixture2Path,
        json: {
          name: 'project-2',
          workspaces: [
            "components/{atom,molecule}/*",
            "website"
          ]
        } 
      },
      workspaces: expect.arrayContaining([
        {
          path: `${fixture2Path}/website`,
          json: {
            name: '@ui/website',
            private: true
          }
        },
        {
          path: `${fixture2Path}/components/atom/button`,
          json: {
            name: '@ui/button'
          }
        },
        {
          path: `${fixture2Path}/components/molecule/feature-panel`,
          json: {
            name: '@ui/feature-panel'
          }
        }
      ])
    });
  });
});
