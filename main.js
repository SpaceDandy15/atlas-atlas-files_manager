import redisClient from './utils/redis';

(async () => {
  // Wait a little for Redis client to connect
  // or better: poll/wait until isAlive() === true

  // Simple delay helper
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Wait max 2 seconds for Redis to connect
  let retries = 20;
  while (!redisClient.isAlive() && retries > 0) {
    await delay(100);
    retries--;
  }

  console.log(redisClient.isAlive());   // Should now print true
  console.log(await redisClient.get('myKey'));
  await redisClient.set('myKey', 12, 5);
  console.log(await redisClient.get('myKey'));

  setTimeout(async () => {
    console.log(await redisClient.get('myKey'));
  }, 10000);
})();
