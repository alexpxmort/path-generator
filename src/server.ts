import { start } from '@ports/server';

start().then((result: string) => {
  console.log(result);
});
