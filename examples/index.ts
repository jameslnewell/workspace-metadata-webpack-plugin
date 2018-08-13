import {getMetadata} from '../src';

(async () => {
  try {
    const metadata = await getMetadata(`${__dirname}/../fixtures`);
    console.log(metadata);
  } catch (error) {
    console.error(error);
  }
})();
