#---------------------------
# Connect
#---------------------------
# Syntax
# redis-cli -u redis://host:port
# redis-cli -u redis://username:password@host:port

# Examples
redis-cli
redis-cli -u redis://localhost:6379
redis-cli -u redis://myuser:mypassword@localhost:6379

# If you run Redis through Docker
# docker exec -it <container-id-or-name> redis-cli

#---------------------------
# Strings/Numbers
#---------------------------
# SET key value
# Set key to hold the string value. If key already holds a value, it is overwritten, regardless of its type.
# O(1)
SET myKey "Hello"
#"OK"
#---------------------------

# GET key
# Get the string value of key. If the key does not exist the special value nil is returned.
# O(1)
GET myKey
#"Hello"
#---------------------------

# MGET key [key ...]
# Returns the values of all specified keys. For every key that does not hold a string value or does not exist, the special value nil is returned.
# O(N)
MGET myKey nonExistentKey
#1) "Hello" 2) (nil)
#---------------------------

# INCR key
# Increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation.
# O(1)
INCR myCounter
#(integer) 1
#---------------------------

#---------------------------
# Generic
#---------------------------
# KEYS pattern
# Returns all keys matching pattern.
# O(N)
KEYS my*
#1) "myKey" 2) "myCounter"
#---------------------------

# EXISTS key [key ...]
# Checks if one or more keys exist.
# O(N)
EXISTS myKey
#(integer) 1
#---------------------------

# EXPIRE key seconds
# Set a timeout on a key.After the timeout has expired, the key will automatically be deleted.
# O(1)
EXPIRE myKey 120
#(integer) 1
#---------------------------

# TTL key
# Returns the remaining time to live of a key that has a timeout.
# O(1)
TTL myKey
#(integer) 113
#---------------------------

# PERSIST key
# Removes the expiration from a key.
# O(1)
PERSIST myKey
#(integer) 1
#---------------------------

# SCAN cursor [MATCH pattern] [COUNT count]
# Iterates the set of keys in the currently selected Redis database.
# O(1) for every call. O(N) for a complete iteration.
SCAN 0 MATCH my* COUNT 2
#1) "3" 2) 1) "myCounter" 2) "myKey"
#---------------------------

# DEL key [key ...]
# Removes the specified keys.
# O(N)
DEL myKey
#(integer) 1
#---------------------------

# INFO [section]
# Returns information and statistics about the server, with the different sections
# like - server, clients, memory, persistence, stats, replication, cpu, commandstats,
# latencystats, sentinel, cluster, modules, keyspace, errorstats.
# O(1)
INFO server
INFO keyspace
# Server
# redis_version:6.2.5
# redis_git_sha1:00000000
# redis_build_id:9893b2a-dirty
# redis_mode:standalone
# os:Linux 5.4.72-microsoft-standard-WSL2 x86_64
# arch_bits:64
# ...
# Keyspace db0:keys=2,expires=0,avg_ttl=0
#---------------------------

#---------------------------
# Hashes
#---------------------------
# HSET key field value [field value ...]
# Sets the specified fields to their respective values in the hash stored at key.
# O(N)
HSET h_employee_profile:101 name "Nicol" age 33
#(integer) 2
#---------------------------

# HGET key field
# Returns the value associated with field in the hash stored at key.
# O(1)
HGET h_employee_profile:101 name 
#"Nicol"
#---------------------------

# HGETALL key
# Returns all fields and values of the hash stored at key.
# O(N)
HGETALL h_employee_profile:101
#1) "name" 2) "Nicol" 3) "age" 4) "33"
#---------------------------

# HMGET key field1 [field2]
# Returns the values associated with the specified fields in the hash stored at key.
# O(N)
HMGET h_employee_profile:101 name age
#1) "Nicol" 2) "33"
#---------------------------

#---------------------------
# Sets
#---------------------------

# SADD key member [member ...]
# Adds the specified members to the set stored at key.
# O(N)
SADD mySet "Hello"
#(integer) 1
#---------------------------

# SMEMBERS key
# Returns all the members of the set value stored at key.
# O(N)
SMEMBERS mySet
#1) "Hello"
#---------------------------

# SCARD key
# Returns the set cardinality (number of elements) of the set stored at key.
# O(1)
SCARD mySet
#(integer) 1
#---------------------------

# SISMEMBER key member
# Returns if member is a member of the set stored at key.
# O(1)
SISMEMBER mySet "Hello"
#(integer) 1
#---------------------------

# SDIFF key1 [key2]
# Returns the members of the set resulting from the difference between the first set and all the successive sets.
# O(N)
SDIFF mySet myOtherSet
#1) "Hello"
#---------------------------

# SDIFFSTORE destination key1 [key2]
# This command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination.
# O(N)
SDIFFSTORE myNewSet mySet myOtherSet
#(integer) 1
#---------------------------

# SREM key member [member ...]
# Removes the specified members from the set stored at key.
SREM mySet "Hello"
#(integer) 1
#---------------------------

#---------------------------
# Sorted sets
#---------------------------

# ZADD key score member [score member ...]
# Adds all the specified members with the specified scores to the sorted set stored at key.
# O(log(N))
ZADD myZSet 1 "one" 2 "two"
#(integer) 2
#---------------------------

# ZRANGE key start stop [WITHSCORES]
# Returns the specified range of elements in the sorted set stored at key.
# O(log(N)+M) where M is the number of elements returned
ZRANGE myZSet 0 -1
#1) "one" 2)"two"
#---------------------------

#---------------------------
# Lists
#---------------------------

# LPUSH key value [value ...]
# Inserts the specified values at the head of the list stored at key.
# O(N)
LPUSH myList "World"
#(integer) 1
#---------------------------

# RPUSH key value [value ...]
# Inserts the specified values at the tail of the list stored at key.
# O(N)
RPUSH myList "Hello"
#(integer) 2
#---------------------------

# LRANGE key start stop
# Returns the specified elements of the list stored at key.
# O(S+N) where S is the distance of start and N is the number of elements in the specified range.
LRANGE myList 0 -1
#1) "World" 2) "Hello"
#---------------------------

# LLEN key
# Returns the length of the list stored at key.
# O(1)
LLEN myList
#(integer) 2
#---------------------------

# LPOP key [count]
# Removes and returns the first element of the list stored at key.
# O(N)
LPOP myList
#"World"
#---------------------------

# RPOP key [count]
# Removes and returns the last element of the list stored at key.
# O(N)
RPOP myList
#"Hello"
#---------------------------


#---------------------------
# Streams
#---------------------------

# XADD key field value [field value ...]
# Appends the specified stream entry to the stream at the specified key.
# O(1) when adding a new entry.
XADD myStream * sensorId "1234" temperature "19.8"
#1518951480106-0
#---------------------------

# XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]
# Read data from one or multiple streams, only returning entries with an ID greater than the last received ID reported by the caller.
XREAD COUNT 2 STREAMS myStream 0
#1) 1) "myStream" 2) 1) 1) "1518951480106-0" 2) 1) "sensorId" 2) "1234" 3) "temperature" 4) "19.8"
#---------------------------

# XRANGE key start end [COUNT count]
# Returns the entries matching a range of IDs in a stream.
# O(N) with N being the number of elements being returned. If N is constant (e.g. always asking for the first 10 elements with COUNT), you can consider it O(1).
XRANGE myStream 1518951480106-0 1518951480106-0
#1) 1) 1) "1518951480106-0" 2) 1) "sensorId" 2) "1234" 3) "temperature" 4) "19.8"
#---------------------------

# XLEN key
# Returns the number of entries of a stream.
# O(1)
XLEN myStream
#(integer) 1
#---------------------------

# XDEL key ID [ID ...]
# Removes the specified entries from a stream.
# O(1) for each single item to delete in the stream
XDEL myStream 1518951480106-0
#(integer) 1
#---------------------------

# XTRIM key MAXLEN [~] count
# Trims the stream to a different length.
# O(N), with N being the number of evicted entries. Constant times are very small however, since entries are organized in macro nodes containing multiple entries that can be released with a single deallocation.
XTRIM myStream MAXLEN 0
#(integer) 0
#---------------------------


#---------------------------
# JSON
#---------------------------

#---------------------------
# JSON.SET key path value
# Sets JSON value at path in key.
# O(M+N) where M is the original size and N is the new size
JSON.SET employee_profile:1 . '{"name":"Alice"}'
# OK
#---------------------------

#---------------------------
# JSON.GET key [path [path ...]]
# Returns the JSON value at path in key.
# O(N) when path is evaluated to a single value where N is the size of the value, 
# O(N) when path is evaluated to multiple values, where N is the size of the key.
JSON.GET employee_profile:1
# { "name": 'Alice' }
#---------------------------

#---------------------------
# JSON.NUMINCRBY key path number
# Increments a number inside a JSON document.
# O(1) when path is evaluated to a single value,
# O(N) when path is evaluated to multiple values, where N is the size of the key
JSON.SET employee_profile:1 .age 30
JSON.NUMINCRBY employee_profile:1 .age 5
# 35
#---------------------------

#---------------------------
# JSON.OBJKEYS key [path]
# Return the keys in the object that's referenced by path.
# O(N) when path is evaluated to a single value, where N is the number of keys in the object,
# O(N) when path is evaluated to multiple values, where N is the size of the key
JSON.OBJKEYS employee_profile:1
# 1) "name" 2) "age"
#---------------------------

#---------------------------
# JSON.OBJLEN key [path]
# Report the number of keys in the JSON object at path in key.
# O(1) when path is evaluated to a single value, 
# O(N) when path is evaluated to multiple values, where N is the size of the key
JSON.OBJLEN employee_profile:1
# (integer) 2
#---------------------------

#---------------------------
# JSON.ARRAPPEND key [path] value [value ...]
# Append the json values into the array at path after the last element in it.
# O(1) for each value added, O(N) for multiple values added where N is the size of the key
JSON.SET employee_profile:1 .colors '["red", "green", "blue"]'
JSON.ARRAPPEND employee_profile:1 .colors '"yellow"'
# (integer) 4
#---------------------------

#---------------------------
# JSON.ARRINSERT key path index value [value ...]
# Insert the json values into the array at path before the index (shifts to the right).
# O(N) when path is evaluated to a single value where N is the size of the array,
# O(N) when path is evaluated to multiple values, where N is the size of the key
JSON.ARRINSERT employee_profile:1 .colors 2 '"purple"'
# (integer) 5
#---------------------------

#---------------------------
# JSON.ARRINDEX key path value [start [stop]]
# Searches for the first occurrence of a JSON value in an array.
# O(N) when path is evaluated to a single value where N is the size of the array,
# O(N) when path is evaluated to multiple values, where N is the size of the key
JSON.ARRINDEX employee_profile:1 .colors '"purple"'
# (integer) 2
#---------------------------


#---------------------------
# Search and Query
#---------------------------

#---------------------------
# FT.CREATE
# Create an index with the given specification.
# Time Complexity: O(K) where K is the number of fields in the document,
# O(N) for keys in the keySpace
FT.CREATE staff:index 
    ON JSON 
    PREFIX 1 staff: 
    SCHEMA 
    "$.name" AS name TEXT 
    "$.age" AS age NUMERIC 
    "$.isSingle"  AS isSingle TAG 
    '$["skills"][*]' AS skills TAG SEPARATOR "|"
# OK
#---------------------------

#---------------------------
# FT.SEARCH
# Search the index with a query, returning either documents or just ids.
# Time Complexity: O(N)
JSON.SET "staff:1" "$" '{"name":"Bob","age":22,"isSingle":true,"skills":["NodeJS","MongoDB","React"]}'
JSON.SET "staff:2" "$" '{"name":"Alex","age":45,"isSingle":true,"skills":["Python","MySQL","Angular"]}'
FT.SEARCH staff:index 
  "(@name:'alex')" 
  RETURN 1 $ LIMIT 0 10
FT.SEARCH staff:index 
  "((@isSingle:{true}) (@age:[(18 +inf]))" 
  RETURN 1 $ LIMIT 0 10
# Matching documents data
#---------------------------

#---------------------------
# FT.AGGREGATE
# Run a search query on an index, and perform aggregate transformations on the results.
FT.AGGREGATE staff:index "(@age:[(18 +inf])"
  GROUPBY 1 @age
  	REDUCE COUNT_DISTINCT 1 @name AS staff_count
# | age | staff_count |
# | ----| ------------|
# | 22  | 1           |
# | 45  | 1           |
#---------------------------

#---------------------------
# FT.INFO
# Return information and statistics on the index.
# Time Complexity: O(1)
FT.INFO staff:index
# A list of configuration parameters and stats for the index.
#---------------------------

#---------------------------
# FT.DROPINDEX
# Dropping existing index.
# Time Complexity: O(1) or O(N) if documents are deleted, where N is the number of keys in the keyspace
FT.DROPINDEX staff:index
# OK
#---------------------------

