import {
  createClient, commandOptions,
  RediSearchSchema, SchemaFieldTypes, AggregateGroupByReducers, AggregateSteps
} from "redis";

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

const streams = async () => {
  if (client) {
    /*
    XADD key field value [field value ...]
    Appends the specified stream entry to the stream at the specified key.
    O(1) when adding a new entry.
    */

    const xAddResult = await client.xAdd(
      'myStream',
      '*', //dynamic id
      {
        sensorId: "1234",
        temperature: "19.8"
      }
    );
    console.log(xAddResult); // "1518951480106-0"

    /*
    XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]
    Read data from one or multiple streams, only returning entries with an ID greater than the last received ID reported by the caller.
    */
    const xReadResult = await client.xRead(
      commandOptions({
        isolated: true
      }),
      [{  // XREAD can read from multiple streams, starting at a different ID for each.
        key: "myStream",
        id: "0" //entries greater than id
      }],
      {
        // Read 2 entries at a time, block for 5 seconds if there are none.
        COUNT: 2,
        BLOCK: 5000
      }
    );

    console.log(JSON.stringify(xReadResult)); // [{"name":"myStream","messages":[{"id":"1518951480106-0","message":{"sensorId":"1234","temperature":"19.8"}}]}]

    /*
    XRANGE key start end [COUNT count]
    Returns the entries matching a range of IDs in a stream.
    O(N) with N being the number of elements being returned. If N is constant (e.g. always asking for the first 10 elements with COUNT), you can consider it O(1).
    */
    const xRangeResult = await client.xRange('myStream', xAddResult, xAddResult);
    console.log(JSON.stringify(xRangeResult)); // [{"id":"1518951480106-0","message":{"sensorId":"1234","temperature":"19.8"}}]

    /*
    XLEN key
    Returns the number of entries of a stream.
    O(1)
    */
    const xLenResult = await client.xLen('myStream');
    console.log(xLenResult); // 1

    /*
    XDEL key ID [ID ...]
    Removes the specified entries from a stream.
    O(1) for each single item to delete in the stream
    */
    const xDelResult = await client.xDel('myStream', xAddResult);
    console.log(xDelResult); // 1

    /*
    XTRIM key MAXLEN [~] count
    Trims the stream to a different length.
    O(N), with N being the number of evicted entries. Constant times are very small however, since entries are organized in macro nodes containing multiple entries that can be released with a single deallocation.
    */
    const xTrimResult = await client.xTrim('myStream', 'MAXLEN', 0);
    console.log(xTrimResult); // 0
  }
};

const json = async () => {
  if (client) {
    /*
      JSON.SET key path value
      Sets JSON value at path in key.
      O(M+N) where M is the original size and N is the new size
    */
    const setResult = await client.json.set('employee_profile:1', '.', {
      name: 'Alice',
    });
    console.log(setResult); // OK

    /*
       JSON.GET key [path [path ...]]
       Returns the JSON value at path in key.
       O(N) when path is evaluated to a single value where N is the size of the value, O(N) when path is evaluated to multiple values, where N is the size of the key
    */
    const getResult = await client.json.get('employee_profile:1');
    console.log(getResult); // { name: 'Alice' }

    /*
      JSON.NUMINCRBY key path number
      Increments a number inside a JSON document.
      O(1) when path is evaluated to a single value, O(N) when path is evaluated to multiple values, where N is the size of the key
    */
    await client.json.set('employee_profile:1', '.age', 30);
    const incrementResult = await client.json.numIncrBy('employee_profile:1', '.age', 5);
    console.log(incrementResult); // 35 

    /*
      JSON.OBJKEYS key [path]
      Return the keys in the object that's referenced by path
      O(N) when path is evaluated to a single value, where N is the number of keys in the object, O(N) when path is evaluated to multiple values, where N is the size of the key
    */
    const objKeysResult = await client.json.objKeys('employee_profile:1');
    console.log(objKeysResult); // [ 'name', 'age' ]

    /*
      JSON.OBJLEN key [path]
      Report the number of keys in the JSON object at path in key
      O(1) when path is evaluated to a single value, O(N) when path is evaluated to multiple values, where N is the size of the key
    */
    const objLenResult = await client.json.objLen('employee_profile:1');
    console.log(objLenResult); // 2

    /*
      JSON.ARRAPPEND key [path] value [value ...]
      Append the json values into the array at path after the last element in it
      O(1) for each value added, O(N) for multiple values added where N is the size of the key
    */
    await client.json.set('employee_profile:1', '.colors', ['red', 'green', 'blue']);
    const arrAppendResult = await client.json.arrAppend(
      'employee_profile:1',
      '.colors',
      'yellow',
    );
    console.log(arrAppendResult); // 4

    /*
      JSON.ARRINSERT key path index value [value ...]
      Insert the json values into the array at path before the index (shifts to the right)
      O(N) when path is evaluated to a single value where N is the size of the array, O(N) when path is evaluated to multiple values, where N is the size of the key
    */
    const arrInsertResult = await client.json.arrInsert(
      'employee_profile:1',
      '.colors',
      2,
      'purple',
    );
    console.log(arrInsertResult); // 5 

    /*
      JSON.ARRINDEX key path json [start [stop]]
      Searches for the first occurrence of a JSON value in an array.
      O(N) when path is evaluated to a single value where N is the size of the array, O(N) when path is evaluated to multiple values, where N is the size of the key
    */
    const arrIndexResult = await client.json.arrIndex(
      'employee_profile:1',
      '.colors',
      'purple',
    );
    console.log(arrIndexResult); // 2 
  }
};

const addStaffEntries = async () => {
  if (client) {
    await client.json.set('staff:1', '.', {
      name: 'Bob',
      age: 22,
      isSingle: true,
      skills: ['NodeJS', 'MongoDB', 'React'],
    });
    await client.json.set('staff:2', '.', {
      name: 'Alex',
      age: 45,
      isSingle: true,
      skills: ['Python', 'MySQL', 'Angular'],
    });
  }
};

const searchAndQuery = async () => {
  if (client) {


    const STAFF_INDEX_KEY = "staff:index";
    const STAFF_KEY_PREFIX = "staff:";

    try {
      /*
       FT.DROPINDEX index [DD]
       Dropping existing index
       O(1) or O(N) if documents are deleted, where N is the number of keys in the keyspace
      */
      await client.ft.dropIndex(STAFF_INDEX_KEY);
    } catch (indexErr) {
      console.error(indexErr);
    }

    /*
   FT.CREATE index [ON HASH | JSON] [PREFIX n] SCHEMA [field type [field type ...]]
   Create an index with the given specification
   O(K) where K is the number of fields in the document, O(N) for keys in the keyspace
 */
    const schema: RediSearchSchema = {
      '$.name': {
        type: SchemaFieldTypes.TEXT,
        AS: 'name',
      },
      '$.age': {
        type: SchemaFieldTypes.NUMERIC,
        AS: 'age',
      },
      '$.isSingle': {
        type: SchemaFieldTypes.TAG,
        AS: 'isSingle',
      },
      '$["skills"][*]': {
        type: SchemaFieldTypes.TAG,
        AS: 'skills',
        SEPARATOR: '|'
      },
    }
    await client.ft.create(STAFF_INDEX_KEY, schema, {
      ON: 'JSON',
      PREFIX: STAFF_KEY_PREFIX,
    });

    await addStaffEntries();

    /*
    FT.SEARCH index query
    Search the index with a query, returning either documents or just ids
    O(N)
    */

    const query1 = "*"; //all records
    const query2 = "(@name:'alex')"; // name == 'alex'
    const query3 = "( (@isSingle:{true}) (@age:[(18 +inf]) )"; //isSingle == true && age > 18
    const query4 = "(@skills:{NodeJS})";
    const searchResult = await client.ft.search(
      STAFF_INDEX_KEY,
      query1, //query2, query3, query4
      {
        RETURN: ['name', 'age', 'isSingle'],
        LIMIT: {
          from: 0,
          size: 10
        }
      }
    );
    console.log(JSON.stringify(searchResult));
    //{"total":1,"documents":[{"id":"staff:2","value":{"name":"Alex","age":"45","isSingle":"1"}}]}

    /*
    FT.AGGREGATE index query
    Run a search query on an index, and perform aggregate transformations on the results

    FT.AGGREGATE staff:index "(@age:[(10 +inf])" 
      GROUPBY 1 @age 
        REDUCE COUNT 0 AS userCount
      SORTBY 1 @age
      LIMIT 0 10
    */
    const aggregateResult = await client.ft.aggregate(
      STAFF_INDEX_KEY,
      "(@age:[(10 +inf])",
      {
        STEPS: [
          {
            type: AggregateSteps.GROUPBY,
            properties: ["@age"],
            REDUCE: [{
              type: AggregateGroupByReducers.COUNT,
              AS: "userCount",
            }]
          },
          {
            type: AggregateSteps.SORTBY,
            BY: "@age"
          },
          {
            type: AggregateSteps.LIMIT,
            from: 0,
            size: 10,
          },
        ]
      }
    );
    console.log(JSON.stringify(aggregateResult));
    //{"total":2,"results":[{"age":"22","userCount":"1"},{"age":"45","userCount":"1"}]}
    //----

    /*
    FT.INFO index
    Return information and statistics on the index
    O(1)
    */
    const infoResult = await client.ft.info(STAFF_INDEX_KEY);
    console.log(infoResult);
    /**
     {
        indexName: 'staff:index',
        numDocs: '2',
        maxDocId: '4',
        stopWords: 2
        ...
     }
     */

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
  await streams();
  await json();
  await searchAndQuery();

  await disconnectRedis();
};

init();
