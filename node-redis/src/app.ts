import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient> | null;
let client: RedisClient = null;
const REDIS_CON_URL = "redis://localhost:6379";

const connectRedis = async () => {
  client = createClient({ url: REDIS_CON_URL });
  await client.connect();
};

const disconnectRedis = async () => {
  if (client) {
    await client.disconnect();
  }
};

const stringsAndNumbers = async () => {
  if (client) {

    /*
  SET key value
  Set key to hold the string value. If key already holds a value, it is overwritten, regardless of its type.
  Time Complexity: O(1)
  */
    const setResult = await client.set("myKey", "Hello");
    console.log(setResult); // "OK"

    /*
  GET key
  Get the string value of key. If the key does not exist the special value nil is returned.
  Time Complexity: O(1)
  */
    const getResult = await client.get("myKey");
    console.log(getResult); // "Hello"

    /*
  MGET key [key ...]
  Returns the values of all specified keys. For every key that does not hold a string value or does not exist, the special value nil is returned.
  Time Complexity: O(N)
  */
    const mGetResult = await client.mGet(["myKey", "nonExistentKey"]);
    console.log(mGetResult); // ["Hello", null]

    /*
  INCR key
  Increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation.
  Time Complexity: O(1)
  */
    const incrResult = await client.incr("myCounter");
    console.log(incrResult); // 1
  }
};

const generic = async () => {
  if (client) {
    /*
    KEYS pattern
    Returns all keys matching pattern.
    Time Complexity: O(N)
    */
    const keysResult = await client.keys('my*');
    console.log(keysResult); // ["myKey", "myCounter"]

    /*
    EXISTS key [key ...]
    Checks if one or more keys exist.
    Time Complexity: O(N)
    */
    const existsResult = await client.exists('myKey');
    console.log(existsResult); // 1

    /*
    EXPIRE key seconds
    Set a timeout on a key. After the timeout has expired, the key will automatically be deleted.
    Time Complexity: O(1)
    */
    const expireResult = await client.expire('myKey', 120);
    console.log(expireResult); // true

    /*
    TTL key
    Returns the remaining time to live of a key that has a timeout.
    Time Complexity: O(1)
    */
    const ttlResult = await client.ttl('myKey');
    console.log(ttlResult); // 113

    /*
    PERSIST key
    Removes the expiration from a key.
    Time Complexity: O(1)
    */
    const persistResult = await client.persist('myKey');
    console.log(persistResult); // true

    /*
    SCAN cursor [MATCH pattern] [COUNT count]
    Iterates the set of keys in the currently selected Redis database.
    Time Complexity: O(1) for every call. O(N) for a complete iteration.
    */
    const scanOptions = {
      TYPE: 'string',
      MATCH: 'my*',
      COUNT: 2,
    };
    let cursor = 0;

    // scan 1
    let scanResult = await client.scan(cursor, scanOptions);
    console.log(scanResult); // { cursor: 4, keys: [ 'myCounter', 'myKey' ] }

    // scan 2
    cursor = scanResult.cursor;
    scanResult = await client.scan(cursor, scanOptions);
    console.log(scanResult); //{ cursor: 12, keys: [ 'myOtherkey' ] }

    // ... scan n 

    console.log('OR use any loop to continue the scan by cursor value');
    cursor = 0;
    do {
      scanResult = await client.scan(cursor, scanOptions);
      console.log(scanResult);
      cursor = scanResult.cursor;

    } while (cursor != 0);


    /*
    DEL key [key ...]
    Removes the specified keys.
    Time Complexity: O(N)
    */
    const delResult = await client.del('myKey');
    console.log(delResult); // 1

    /*
    INFO [section]
    Returns information and statistics about the server, with the different sections
        like - server, clients, memory, persistence, stats, replication, cpu, commandstats,
        latencystats, sentinel, cluster, modules, keyspace, errorstats.
    Time Complexity: O(1)
    */
    let infoResult = await client.info('keyspace');
    console.log(infoResult); //# Keyspace \n db0:keys=2,expires=0,avg_ttl=0"
  }
};

const hashes = async () => {
  if (client) {
    /*
    HSET key field value [field value ...]
    Sets the specified fields to their respective values in the hash stored at key.
    Time Complexity: O(N)
    */

    const hSetResult = await client.hSet(
      'h_employee_profile:101', {
      name: 'Nicol',
      age: 33
    }
    );
    console.log(hSetResult); // 2

    /*
    HGET key field
    Returns the value associated with field in the hash stored at key.
    Time Complexity: O(1)
    */
    const hGetResult = await client.hGet('h_employee_profile:101', 'name');
    console.log(hGetResult); // "Nicol"

    /*
    HGETALL key
    Returns all fields and values of the hash stored at key.
    Time Complexity: O(N)
    */
    const hGetAllResult = await client.hGetAll('h_employee_profile:101');
    console.log(hGetAllResult); // {name: "Nicol", age: "33"}

    /*
    HMGET key field1 [field2]
    Returns the values associated with the specified fields in the hash stored at key.
    Time Complexity: O(N)
    */
    const hmGetResult = await client.hmGet('h_employee_profile:101', ['name', 'age']);
    console.log(hmGetResult); // ["Nicol", "33"]
  }
};

const sets = async () => {
  if (client) {
    /*
    SADD key member [member ...]
    Adds the specified members to the set stored at key.
    Time Complexity: O(N)
    */
    const sAddResult = await client.sAdd('mySet', 'Hello');
    console.log(sAddResult); // 1

    /*
    SMEMBERS key
    Returns all the members of the set value stored at key.
    Time Complexity: O(N)
    */
    const sMembersResult = await client.sMembers('mySet');
    console.log(sMembersResult); // ["Hello"]

    /*
    SCARD key
    Returns the set cardinality (number of elements) of the set stored at key.
    Time Complexity: O(1)
    */
    const sCardResult = await client.sCard('mySet');
    console.log(sCardResult); // 1

    /*
    SISMEMBER key member
    Returns if member is a member of the set stored at key.
    Time Complexity: O(1)
    */
    const sIsMemberResult = await client.sIsMember('mySet', 'Hello');
    console.log(sIsMemberResult); // true

    /*
    SDIFF key1 [key2]
    Returns the members of the set resulting from the difference between the first set and all the successive sets.
    Time Complexity: O(N)
    */
    const sDiffResult = await client.sDiff(['mySet', 'myOtherSet']);
    console.log(sDiffResult); // ["Hello"]

    /*
    SDIFFSTORE destination key1 [key2]
    This command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination.
    Time Complexity: O(N)
    */
    const sDiffStoreResult = await client.sDiffStore('myNewSet', [
      'mySet',
      'myOtherSet']
    );
    console.log(sDiffStoreResult); // 1


    /*
    SREM key member [member ...]
    Removes the specified members from the set stored at key.
    */
    const sRemResult = await client.sRem('mySet', 'Hello');
    console.log(sRemResult); // 1

  }
};

const sortedSets = async () => {
  if (client) {
    /*
    ZADD key score member [score member ...]
    Adds all the specified members with the specified scores to the sorted set stored at key.
    Time Complexity: O(log(N))
    */
    const zAddResult = await client.zAdd('myZSet', [{
      score: 1,
      value: "one"
    }, {
      score: 2,
      value: "two"
    }]);
    console.log(zAddResult); // 2

    /*
    ZRANGE key start stop [WITHSCORES]
    Returns the specified range of elements in the sorted set stored at key.
    Time Complexity: O(log(N)+M) where M is the number of elements returned
    */
    const zRangeResult = await client.zRange('myZSet', 0, -1);
    console.log(zRangeResult); // ["one", "two"]
  }
};

const lists = async () => {
  if (client) {
    /*
    LPUSH key value [value ...]
    Inserts the specified values at the head of the list stored at key.
    Time Complexity: O(N)
    */
    const lPushResult = await client.lPush('myList', 'World');
    console.log(lPushResult); // 1

    /*
    RPUSH key value [value ...]
    Inserts the specified values at the tail of the list stored at key.
    Time Complexity: O(N)
    */
    const rPushResult = await client.rPush('myList', 'Hello');
    console.log(rPushResult); // 2

    /*
    LRANGE key start stop
    Returns the specified elements of the list stored at key.
    Time Complexity: O(S+N) where S is the distance of start and N is the number of elements in the specified range.
    */
    const lRangeResult = await client.lRange('myList', 0, -1);
    console.log(lRangeResult); // ["World", "Hello"]

    /*
    LLEN key
    Returns the length of the list stored at key.
    Time Complexity: O(1)
    */
    const lLenResult = await client.lLen('myList');
    console.log(lLenResult); // 2

    /*
    LPOP key [count]
    Removes and returns the first element of the list stored at key.
    Time Complexity: O(N)
    */
    const lPopResult = await client.lPop('myList');
    console.log(lPopResult); // "World"

    /*
    RPOP key [count]
    Removes and returns the last element of the list stored at key.
    Time Complexity: O(N)
    */
    const rPopResult = await client.rPop('myList');
    console.log(rPopResult); // "Hello"
  }
};
const init = async () => {
  await connectRedis();

  await stringsAndNumbers();
  await generic();
  await hashes();
  await sets();
  await sortedSets();
  await lists();

  await disconnectRedis();
};

init();
