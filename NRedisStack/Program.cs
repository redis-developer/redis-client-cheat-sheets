/*************************************************************************
 * NRedisStack Cheat Sheet
 * Cheat Sheet
 *
 * This cheat sheet covers a number of commonly used Redis commands.
 * Before starting, Bulk upload the employee.redis file to your database
 *************************************************************************/
using System;
using System.Linq;
using Microsoft.VisualBasic.FileIO;
using NRedisStack;
using NRedisStack.RedisStackCommands;
using NRedisStack.Search;
using NRedisStack.Search.Aggregation;
using NRedisStack.Search.Literals.Enums;
using StackExchange.Redis;
using static NRedisStack.Search.Query;

namespace NRedisStack
{
    class Program
    {
        static void Main(string[] args)
        {
            ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("localhost");
            IDatabase db = redis.GetDatabase();

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
            db.StringSet("mykey", "Hello");
            // OK
            db.StringSet("mykey2", "World");
            // OK

            /*
             * GET key
             * O(1)
             * Get the value of key. If the key does not exist the special value nil
             */
            db.StringGet("mykey");
            // "Hello"

            /*
             * MGET key [key ...]
             * O(N)
             * Returns the values of all specified keys. For every key that does not hold a
             * string value or does not exist, the special value nil is returned.
             */
            db.StringGet(new RedisKey[] { "mykey", "mykey2", "nonexistantkey" });
            // [Hello, World, null]

            /*
             * INCR key
             * O(1)
             * Increments the number stored at key by one. If the key does not exist, it is
             * set to 0 before performing the operation.
             */
            db.KeyDelete("mykey");
            // 1
            db.StringIncrement("mykey");
            // 1
            db.StringGet("mykey");
            // "1"

            /*************************************************************************
             * Generic
             *************************************************************************/

            /*
             * KEYS pattern
             * O(N)
             * Returns all keys matching pattern.
             */
            redis.GetServer("localhost:6379").Keys();
            // [mykey, mykey2]

            /*
             * EXPIRE key seconds
             * O(1)
             * Set a timeout on key. After the timeout has expired, the key will be
             * automatically deleted.
             */
            db.KeyExpire("mykey", TimeSpan.FromSeconds(10));
            // 1

            /*
             * SCAN cursor [MATCH pattern] [COUNT count]
             * O(1) for every call. O(N) for a complete iteration, including enough command
             * calls for the cursor to return back to 0.
             * Iterates the set of keys in the currently selected Redis database.
             */
            db.KeyDelete(new RedisKey[] { "mykey", "mykey2" });
            redis.GetServer("localhost:6379").Keys(-1, "employee_profile:*", 10);
            // [employee_profile:nicol, employee_profile:akash,
            // employee_profile:mano,employee_profile:alexa, employee_profile:ashu,
            // employee_profile:karol, employee_profile:carol, employee_profile:sunny,
            // employee_profile:peter, employee_profile:katie]

            /*
             * DEL key [key ...]
             * O(N)
             * Removes the specified keys.
             */
            db.KeyDelete(new RedisKey[] { "employee_profile:viraj", "employee_profile:terry", "employee_profile:sheera" });
            // 3

            /*
             * TTL key
             * O(1)
             * Returns the remaining time to live of a key that has a timeout.
             */
            db.KeyTimeToLive("employee_profile:nicol");
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
            db.HashSet("h_employee_profile:nicol", new HashEntry[] { new HashEntry("name", "Nicol") });
            // 1

            /*
             * HGETALL key
             * O(N)
             * Returns all fields and values of the hash stored at key.
             */
            db.HashGetAll("h_employee_profile:nicol");
            // {name=Nicol}

            /*
             * HGET key field
             * O(1)
             * Returns the value associated with field in the hash stored at key.
             */
            db.HashGet("h_employee_profile:nicol", "name");
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
            db.KeyDelete("myzset");
            db.SortedSetAdd("myzset", new SortedSetEntry[] { new SortedSetEntry("one", 1.0), new SortedSetEntry("two", 2.0), new SortedSetEntry("three", 3.0) });
            // jedis.zadd("myzset", Map.of("one", 1.0,
            // "two", 2.0,
            // "three", 3.0));

            /*
             * ZRANGE key start stop [WITHSCORES]
             * O(log(N)+M)
             * Returns the specified range of elements in the sorted set stored at key.
             */
            db.SortedSetRangeByRank("myzset", 0, -1);
            // [one, two, three]
            db.SortedSetRangeByRankWithScores("myzset", 0, -1);
            // [{one=1.0}, {two=2.0}, {three=3.0}]

            /*************************************************************************
             * Sets
             *************************************************************************/

            /*
             * SADD key member [member ...]
             * O(N)
             * Add the specified members to the set stored at key.
             */
            db.SetAdd("myset", "Hello");
            // 1

            /*************************************************************************
             * Lists
             *************************************************************************/

            /*
             * LPOP key [count]
             * O(N)
             * Removes and returns the first elements of the list stored at key.
             */
            db.ListLeftPush("mylist", new RedisValue[] { "one", "two", "three", "four", "five" });
            // 5
            db.ListLeftPop("mylist");
            // "one"
            db.ListLeftPop("mylist", 2);
            // [two, three]

            /*
             * LRANGE key start stop
             * O(S+N)
             * Returns the specified elements of the list stored at key.
             */
            db.KeyDelete("mylist");
            // 1
            db.ListRightPush("mylist", new RedisValue[] { "one", "two", "three", "four", "five" });
            // 5
            db.ListRange("mylist", 0, -1);
            // [one, two, three, four, five]
            db.ListRange("mylist", -3, 2);
            // [three]

            /*
             * LPUSH key value [value ...]
             * O(N)
             * Insert all the specified values at the head of the list stored at key.
             */
            db.KeyDelete("mylist");
            // 1
            db.ListLeftPush("mylist", new RedisValue[] { "world" });
            // 1
            db.ListLeftPush("mylist", new RedisValue[] { "hello" });
            // 2
            db.ListRange("mylist", 0, -1);
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
            db.StreamAdd("temperatures:us-ny:10007", new NameValueEntry[] { new NameValueEntry("temp_f", "87.2"), new NameValueEntry("pressure", "29.69"), new NameValueEntry("humidity", "46.0") });
            // 1694642270670-0
            db.StreamAdd("temperatures:us-ny:10007", new NameValueEntry[] { new NameValueEntry("temp_f", "83.1"), new NameValueEntry("pressure", "29.21"), new NameValueEntry("humidity", "46.5") });
            // 1694642270671-0
            db.StreamAdd("temperatures:us-ny:10007", new NameValueEntry[] { new NameValueEntry("temp_f", "81.9"), new NameValueEntry("pressure", "28.37"), new NameValueEntry("humidity", "43.7") });
            // 1694642270672-0

            /*
             * XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]
             * Read data from one or multiple streams, only returning entries with an ID
             * greater than the last received ID reported by the caller.
             */
            db.StreamRead("temperatures:us-ny:10007", "0-0");
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
            db.JSON().Set("employee_profile:nicol", ".", new
            {
                name = "Nicol",
                age = 24,
                single = true,
                skills = new string[] { }
            });
            // OK

            db.JSON().Set("employee_profile:nicol", "$.name", "\"Nicol\"");
            // OK

            /*
             * JSON.GET key [path [path ...]]
             * O(N)
             * Return the value at path in JSON serialized form
             */
            db.JSON().Get("employee_profile:nicol", ".");
            // [{"single":true,"skills":[],"name":"Nicol","age":24}]

            /*
             * JSON.ARRAPPEND key [path] value [value ...]
             * O(1) for each value added, O(N) for multiple values added where N is the size
             * of the key
             * Append the value(s) to the array at path in key after the last element in the
             * array.
             */
            db.JSON().Set("employee_profile:nicol", "$.skills", "[]");
            // OK
            db.JSON().ArrAppend("employee_profile:nicol", "$.skills", "python");
            // [1]
            db.JSON().Get("employee_profile:nicol", "$.skills");
            // [["python"]]

            /*
             * JSON.ARRINDEX key path value [start [stop]]
             * O(N)
             * Search for the first occurrence of a JSON value in an array.
             */
            db.JSON().ArrIndex("employee_profile:nicol", "$.skills", "python");
            // [0]
            db.JSON().ArrIndex("employee_profile:nicol", "$.skills", "java");
            // [-1]

            /*************************************************************************
             * Search and Query
             *************************************************************************/

            try
            {
                /*
                 * FT.DROPINDEX index [DD]
                 * O(1)
                 * Deletes an index and all the documents in it.
                 */
                db.FT().DropIndex("idx-employees");
                // OK
            }
            catch
            {
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
            db.FT().Create("idx-employees", new FTCreateParams()
                                                .On(IndexDataType.JSON)
                                                .Prefix("employee_profile:"),
                                            new Schema()
                                                .AddTextField(new FieldName("$.name", "name"), sortable: true)
                                                .AddNumericField(new FieldName("$.age", "age"), sortable: true)
                                                .AddTagField(new FieldName("$.single", "single"))
                                                .AddTagField(new FieldName("$.skills[*]", "skills")));
            // OK

            /*
             * FT.INFO index
             * O(1)
             * Returns information and statistics on the index.
             */
            db.FT().Info("idx-employees");
            // ...

            /*
             * FT._LIST
             * O(1)
             * Returns a list of all existing indexes.
             */
            db.FT()._List();
            // [idx-employees]

            /*
             * FT.SEARCH index query
             * O(N)
             * Search the index with a textual query, returning either documents or just ids
             */
            db.FT().Search("idx-employees", new Query("@name:{nicol}"));
            // SearchResult{Total results:1, Documents:[id:employee_profile:nicol, score:
            // 1.0,
            // properties:[$={"name":"Nicol","age":24,"single":true,"skills":["python"]}]]}

            db.FT().Search("idx-employees", new Query("@single:{false}"));
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


            db.FT().Search("idx-employees", new Query("@skills:{python}"));
            // SearchResult{Total results:1, Documents:[id:employee_profile:nicol, score:
            // 1.0,
            // properties:[$={"name":"Nicol","age":24,"single":true,"skills":["python"]}]]}

            db.FT().Search("idx-employees", new Query().AddFilter(new NumericFilter("@age", 30, 40)));
            // SearchResult{Total results:2, Documents:[id:employee_profile:carol, score:
            // 1.0, properties:[$={"name":"carol","age":40,"single":true,"skills":[]}],
            // id:employee_profile:solomon, score: 1.0,
            // properties:[$={"name":"solomon","age":30,"single":true,"skills":[]}]]}

            db.JSON().ArrAppend("employee_profile:karol", "$.skills", "python", "java", "c#");
            // [3]

            db.FT().Search("idx-employees", new Query("@skills:{java}, @skills:{python}"));
            // SearchResult{Total results:1, Documents:[id:employee_profile:karol, score:
            // 1.0,
            // properties:[$={"name":"karol","age":23,"single":true,"skills":["python","java","c#"]}]]}

            /*
             * FT.AGGREGATE index query
             * O(1)
             * Run a search query on an index, and perform aggregate transformations on the
             * results, extracting statistics etc from them
             */
            db.FT().Aggregate("idx-employees", new AggregationRequest("@age:[20 40]")
                                                .GroupBy("@age", Reducers.Count().As("count"))
                                                .SortBy(new SortedField("@age", SortedField.SortOrder.ASC)));
            // [{age=14, count=1}, {age=15, count=1}, {age=20, count=1}, {age=23, count=3},
            // {age=24, count=1}, {age=30, count=1}, {age=40, count=1}, {age=41, count=2},
            // {age=42, count=1}, {age=43, count=4}]

            db.FT().Aggregate("idx-employees", new AggregationRequest("@skills:{python}")
                                                .GroupBy("@skills", Reducers.ToList("@name").As("names")));
            // [{skills=python, names=[Nicol, karol]}]


            /*************************************************************************
             * Triggers and Functions
             *************************************************************************/

            /*
             * TFUNCTION LOAD "<library-code>"
             * O(1)
             * Load a new JavaScript library into Redis.
             */
            db.TFunctionLoad("#!js api_version=1.0 name=cheatSheet\n redis.registerFunction('hello', (client, data)=>{return `Hello ${JSON.parse(data).name}`})", replace: true);
            // OK
            db.TFunctionList(verbose: 1);

            /*
             * TFCALL <function-name> <key> <args...>
             * Invoke a function.
             */
            db.TFCall_("cheatSheet", "hello", null, new string[] { "{\"name\":\"Nicol\"}" });
        }
    }
}
