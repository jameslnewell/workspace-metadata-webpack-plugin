import * as path from 'path';
import loader from '../src/loader';

const fixture1Path = path.join(__dirname, '..', 'test', '__fixtures__', 'project-1');
const fixture2Path = path.join(__dirname, '..', 'test', '__fixtures__', 'project-2');

function createContext() {
  return {
    async: jest.fn().mockReturnValue(jest.fn())
  };
}

describe('loader', () => {

  it('should return x', () => {
    
    loader.call(createContext(), '');

  });

});
