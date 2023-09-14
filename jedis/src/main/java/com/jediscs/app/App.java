/*************************************************************************
 * Jedis Cheat Sheet
 * Cheat Sheet
 *
 * This cheat sheet covers a number of commonly used Redis commands.
 * Before starting, Bulk upload the employee.redis file to your database
 *************************************************************************/
package com.jediscs.app;

import static java.util.Collections.singletonMap;

import java.util.Map;

import redis.clients.jedis.JedisPooled;
import redis.clients.jedis.StreamEntryID;
import redis.clients.jedis.json.Path2;
import redis.clients.jedis.params.ScanParams;
import redis.clients.jedis.params.XReadParams;
import redis.clients.jedis.resps.ScanResult;
import redis.clients.jedis.search.FTSearchParams;
import redis.clients.jedis.search.IndexDefinition;
import redis.clients.jedis.search.IndexOptions;
import redis.clients.jedis.search.Schema;
import redis.clients.jedis.search.FTSearchParams.NumericFilter;
import redis.clients.jedis.search.aggr.AggregationBuilder;
import redis.clients.jedis.search.aggr.Reducers;
import redis.clients.jedis.search.aggr.SortedField;
import redis.clients.jedis.search.aggr.SortedField.SortOrder;

public class App {
    public static void main(String[] args) {
        JedisPooled jedis = new JedisPooled("localhost", 6379);

        /*************************************************************************
         * Core Commands
         *************************************************************************/

        /*************************************************************************
         * Strings
         *************************************************************************/

        /*
         * SET key value
         * O(1)
         * Set key to hold the string value. If key already holds a value, it is
         * overwritten, regardless of its type.
         */
        jedis.set("mykey", "Hello");
        // OK
        jedis.set("mykey2", "World");
        // OK

        /*
         * GET key
         * O(1)
         * Get the value of key. If the key does not exist the special value nil
         */
        jedis.get("mykey");
        // "Hello"

        /*
         * MGET key [key ...]
         * O(N)
         * Returns the values of all specified keys. For every key that does not hold a
         * string value or does not exist, the special value nil is returned.
         */
        jedis.mget("mykey", "mykey2", "nonexistantkey");
        // [Hello, World, null]

        /*
         * INCR key
         * O(1)
         * Increments the number stored at key by one. If the key does not exist, it is
         * set to 0 before performing the operation.
         */
        jedis.del("mykey");
        // 1
        jedis.incr("mykey");
        // 1
        jedis.get("mykey");
        // "1"

        /*************************************************************************
         * Generic
         *************************************************************************/

        /*
         * KEYS pattern
         * O(N)
         * Returns all keys matching pattern.
         */
        jedis.keys("*");
        // [mykey, mykey2]

        /*
         * EXPIRE key seconds
         * O(1)
         * Set a timeout on key. After the timeout has expired, the key will be
         * automatically deleted.
         */
        jedis.expire("mykey", 10);
        // 1

        /*
         * SCAN cursor [MATCH pattern] [COUNT count]
         * O(1) for every call. O(N) for a complete iteration, including enough command
         * calls for the cursor to return back to 0.
         * Iterates the set of keys in the currently selected Redis database.
         */
        jedis.del("mykey", "mykey2");
        // 2;
        ScanResult<String> scan = jedis.scan("0", new ScanParams() {
            {
                match("employee_profile:*");
            }
        });
        // [employee_profile:viraj, employee_profile:terry, employee_profile:sheera,
        // employee_profile:arun, employee_profile:neil, employee_profile:pari,
        // employee_profile:aaron, employee_profile:nike, employee_profile:samt,
        // employee_profile:simon]
        scan = jedis.scan(scan.getCursor(), new ScanParams() {
            {
                match("employee_profile:*");
            }
        });
        // [employee_profile:nicol, employee_profile:akash,
        // employee_profile:mano,employee_profile:alexa, employee_profile:ashu,
        // employee_profile:karol, employee_profile:carol, employee_profile:sunny,
        // employee_profile:peter, employee_profile:katie]

        /*
         * DEL key [key ...]
         * O(N)
         * Removes the specified keys.
         */
        jedis.del("employee_profile:viraj", "employee_profile:terry", "employee_profile:sheera");
        // 3

        /*
         * TTL key
         * O(1)
         * Returns the remaining time to live of a key that has a timeout.
         */
        jedis.ttl("employee_profile:nicol");
        // -1

        /*************************************************************************
         * Hashes
         *************************************************************************/

        /*
         * HSET key field value [field value ...]
         * O(N)
         * Sets the specified fields to their respective values in the hash stored at
         * key.
         */
        jedis.hset("h_employee_profile:nicol", "name", "Nicol");
        // 1

        /*
         * HGETALL key
         * O(N)
         * Returns all fields and values of the hash stored at key.
         */
        jedis.hgetAll("h_employee_profile:nicol");
        // {name=Nicol}

        /*
         * HGET key field
         * O(1)
         * Returns the value associated with field in the hash stored at key.
         */
        jedis.hget("h_employee_profile:nicol", "name");
        // "Nicol"

        /*************************************************************************
         * Sorted Sets
         *************************************************************************/

        /*
         * ZADD key score member [score member ...]
         * O(log(N))
         * Adds all the specified members with the specified scores to the sorted set
         * stored at key.
         */
        jedis.del("myzset");
        jedis.zadd("myzset", Map.of("one", 1.0,
                "two", 2.0,
                "three", 3.0));

        /*
         * ZRANGE key start stop [WITHSCORES]
         * O(log(N)+M)
         * Returns the specified range of elements in the sorted set stored at key.
         */
        jedis.zrange("myzset", 0, -1);
        // [one, two, three]
        jedis.zrangeWithScores("myzset", 0, -1);
        // [{one=1.0}, {two=2.0}, {three=3.0}]

        /*************************************************************************
         * Sets
         *************************************************************************/

        /*
         * SADD key member [member ...]
         * O(N)
         * Add the specified members to the set stored at key.
         */
        jedis.sadd("myset", "Hello");
        // 1

        /*************************************************************************
         * Lists
         *************************************************************************/

        /*
         * LPOP key [count]
         * O(N)
         * Removes and returns the first elements of the list stored at key.
         */
        jedis.lpush("mylist", "one", "two", "three", "four", "five");
        // 5
        jedis.lpop("mylist");
        // "one"
        jedis.lpop("mylist", 2);
        // [two, three]

        /*
         * LRANGE key start stop
         * O(S+N)
         * Returns the specified elements of the list stored at key.
         */
        jedis.del("mylist");
        // 1
        jedis.rpush("mylist", "one", "two", "three", "four", "five");
        // 5
        jedis.lrange("mylist", 0, -1);
        // [one, two, three, four, five]
        jedis.lrange("mylist", -3, 2);
        // [three]

        /*
         * LPUSH key value [value ...]
         * O(N)
         * Insert all the specified values at the head of the list stored at key.
         */
        jedis.del("mylist");
        jedis.lpush("mylist", "world");
        // 1
        jedis.lpush("mylist", "hello");
        // 2
        jedis.lrange("mylist", 0, -1);
        // [hello, world]

        /*************************************************************************
         * Streams
         *************************************************************************/

        /*
         * XADD key ID field value [field value ...]
         * O(1) for new entries, O(N) when trimming where N is the number of evicted
         * values
         * Appends the specified stream entry to the stream at the specified key.
         */
        jedis.xadd("temperatures:us-ny:10007", StreamEntryID.NEW_ENTRY,
                Map.of("temp_f", "87.2", "pressure", "29.69", "humidity", "46.0"));
        // 1694642270670-0
        jedis.xadd("temperatures:us-ny:10007", StreamEntryID.NEW_ENTRY,
                Map.of("temp_f", "83.1", "pressure", "29.21", "humidity", "46.5"));
        // 1694642270671-0
        jedis.xadd("temperatures:us-ny:10007", StreamEntryID.NEW_ENTRY,
                Map.of("temp_f", "81.9", "pressure", "28.37", "humidity", "43.7"));
        // 1694642270672-0

        /*
         * XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]
         * Read data from one or multiple streams, only returning entries with an ID
         * greater than the last received ID reported by the caller.
         */
        jedis.xread(XReadParams.xReadParams().count(5).block(1000),
                singletonMap("temperatures:us-ny:10007", new StreamEntryID(0, 0)));
        // [temperatures:us-ny:10007=[1694642248374-0 {humidity=46.0, pressure=29.69,
        // temp_f=87.2}, 1694642248376-0 {humidity=46.5, pressure=29.21, temp_f=83.1},
        // 1694642248376-1 {humidity=43.7, pressure=28.37, temp_f=81.9}, 1694642270670-0
        // {humidity=46.0, pressure=29.69, temp_f=87.2}, 1694642270671-0 {humidity=46.5,
        // pressure=29.21, temp_f=83.1}]]

        /*************************************************************************
         * Stack
         *************************************************************************/

        /*************************************************************************
         * JSON
         *************************************************************************/

        /*
         * JSON.SET key path value
         * O(M+N) where M is the original size and N is the new size
         * Set the JSON value at path in key.
         */
        jedis.jsonSet("employee_profile:nicol", Path2.ROOT_PATH,
                "{\"name\":\"nicol\",\"age\":24,\"single\":true,\"skills\":[]}");
        // OK

        jedis.jsonSet("employee_profile:nicol", Path2.of("$.name"),
                "\"Nicol\"");
        // OK

        /*
         * JSON.GET key [path [path ...]]
         * O(N)
         * Return the value at path in JSON serialized form
         */
        jedis.jsonGet("employee_profile:nicol", Path2.ROOT_PATH);
        // [{"single":true,"skills":[],"name":"Nicol","age":24}]

        /*
         * JSON.ARRAPPEND key [path] value [value ...]
         * O(1) for each value added, O(N) for multiple values added where N is the size
         * of the key
         * Append the value(s) to the array at path in key after the last element in the
         * array.
         */
        jedis.jsonSet("employee_profile:nicol", Path2.of("$.skills"),
                "[]");
        // OK
        jedis.jsonArrAppend("employee_profile:nicol", Path2.of("$.skills"), "\"python\"");
        // [1]
        jedis.jsonGet("employee_profile:nicol", Path2.of("$.skills"));
        // [["python"]]

        /*
         * JSON.ARRINDEX key path value [start [stop]]
         * O(N)
         * Search for the first occurrence of a JSON value in an array.
         */
        jedis.jsonArrIndex("employee_profile:nicol", Path2.of("$.skills"), "\"python\"");
        // [0]
        jedis.jsonArrIndex("employee_profile:nicol", Path2.of("$.skills"), "\"java\"");
        // [-1]

        /*************************************************************************
         * Search and Query
         *************************************************************************/

        try {
            jedis.ftDropIndex("idx-employees");
            // OK
        } catch (Exception e) {
            // Index not found
        }

        /*
         * FT.CREATE index [ON HASH | JSON] [PREFIX count prefix [prefix ...]] SCHEMA
         * field_name [AS alias] TEXT | TAG | NUMERIC | GEO | VECTOR | GEOSHAP [SORTABLE
         * [UNF]] [NOINDEX] [ field_name [AS alias] TEXT | TAG | NUMERIC | GEO | VECTOR
         * | GEOSHAPE [ SORTABLE [UNF]] [NOINDEX] ...]
         * O(K) where K is the number of fields in the document, O(N) for keys in the
         * keyspace
         * Creates a new search index with the given specification.
         */
        Schema schema = new Schema()
                .addSortableTextField("$.name", 1.0).as("name")
                .addSortableNumericField("$.age").as("age")
                .addTagField("$.single").as("single")
                .addTagField("$.skills[*]").as("skills");

        IndexDefinition def = new IndexDefinition(IndexDefinition.Type.JSON)
                .setPrefixes("employee_profile:");

        jedis.ftCreate("idx-employees", IndexOptions.defaultOptions().setDefinition(def), schema);
        // OK

        /*
         * FT.INFO index
         * O(1)
         * Returns information and statistics on the index.
         */
        jedis.ftInfo("idx-employees");
        // ...

        /*
         * FT._LIST
         * O(1)
         * Returns a list of all existing indexes.
         */
        jedis.ftList();
        // [idx-employees]

        /*
         * FT.SEARCH index query
         * O(N)
         * Search the index with a textual query, returning either documents or just ids
         */
        jedis.ftSearch("idx-employees", "Nicol");
        // SearchResult{Total results:1, Documents:[id:employee_profile:nicol, score:
        // 1.0,
        // properties:[$={"name":"Nicol","age":24,"single":true,"skills":["python"]}]]}

        jedis.ftSearch("idx-employees", "@single:{false}");
        // SearchResult{Total results:7, Documents:[id:employee_profile:nike, score:
        // 1.0, properties:[$={"name":"nike","age":46,"single":false,"skills":[]}],
        // id:employee_profile:akash, score: 1.0,
        // properties:[$={"name":"akash","age":70,"single":false,"skills":[]}],
        // id:employee_profile:alexa, score: 1.0,
        // properties:[$={"name":"alexa","age":45,"single":false,"skills":[]}],
        // id:employee_profile:peter, score: 1.0,
        // properties:[$={"name":"peter","age":43,"single":false,"skills":[]}],
        // id:employee_profile:sam, score: 1.0,
        // properties:[$={"name":"sam","age":41,"single":false,"skills":[]}],
        // id:employee_profile:cherry, score: 1.0,
        // properties:[$={"name":"cherry","age":49,"single":false,"skills":[]}],
        // id:employee_profile:saint, score: 1.0,
        // properties:[$={"name":"saint","age":43,"single":false,"skills":[]}]]}

        jedis.ftSearch("idx-employees", "@skills:{python}");
        // SearchResult{Total results:1, Documents:[id:employee_profile:nicol, score:
        // 1.0,
        // properties:[$={"name":"Nicol","age":24,"single":true,"skills":["python"]}]]}

        jedis.ftSearch("idx-employees", "*",
                FTSearchParams.searchParams().filter(new NumericFilter("age", 30, 40)));
        // SearchResult{Total results:2, Documents:[id:employee_profile:carol, score:
        // 1.0, properties:[$={"name":"carol","age":40,"single":true,"skills":[]}],
        // id:employee_profile:solomon, score: 1.0,
        // properties:[$={"name":"solomon","age":30,"single":true,"skills":[]}]]}

        jedis.jsonArrAppend("employee_profile:karol", Path2.of("$.skills"), "\"python\"", "\"java\"", "\"c#\"");
        // [3]

        jedis.ftSearch("idx-employees", "@skills:{java}, @skills:{python}");
        // SearchResult{Total results:1, Documents:[id:employee_profile:karol, score:
        // 1.0,
        // properties:[$={"name":"karol","age":23,"single":true,"skills":["python","java","c#"]}]]}

        /*
         * FT.AGGREGATE index query
         * O(1)
         * Run a search query on an index, and perform aggregate transformations on the
         * results, extracting statistics etc from them
         */
        jedis.ftAggregate("idx-employees", new AggregationBuilder()
                .groupBy("@age", Reducers.count().as("count")).sortBy(new SortedField("@age", SortOrder.ASC)))
                .getRows();
        // [{age=14, count=1}, {age=15, count=1}, {age=20, count=1}, {age=23, count=3},
        // {age=24, count=1}, {age=30, count=1}, {age=40, count=1}, {age=41, count=2},
        // {age=42, count=1}, {age=43, count=4}]

        jedis.ftAggregate("idx-employees", new AggregationBuilder("@skills:{python}")
                .groupBy("@skills", Reducers.to_list("@name").as("names")))
                .getRows();
        // [{skills=python, names=[Nicol, karol]}]

        jedis.close();
    }
}