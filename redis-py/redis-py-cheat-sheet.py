##################
# redis-py Cheat Sheet
#
# This cheat sheet covers a number of commonly used Redis commands.
# Before starting, Bulk upload the employee.redis file to your database
##################

import redis
import json
from redis.commands.search.query import NumericFilter, Query
from redis.commands.search.indexDefinition import IndexDefinition, IndexType
from redis.commands.search.field import TextField, NumericField, TagField
import redis.commands.search.reducers as reducers
import redis.commands.search.aggregation as aggregations

r = redis.Redis(host='localhost', port=6379, db=0)

##################
# Core Commands
##################

##################
# Strings
##################

# SET key value
# O(1)
# Set key to hold the string value. If key already holds a value, it is overwritten, regardless of its type.
r.set('mykey', 'Hello')
# True
r.set('mykey2', 'World')
# True

# GET key
# O(1)
# Get the string value of key. If the key does not exist the special value nil is returned.
r.get('mykey')
# b'Hello'

# MGET key [key ...]
# O(N)
# Returns the values of all specified keys. For every key that does not hold a string value or does not exist, the special value nil is returned.
r.mget(['mykey', 'mykey2', 'nonexistantkey'])
# [b'Hello', b'World', None]

# INCR key
# O(1)
# Increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation.
r.delete('mykey')
# 1
r.incr('mykey', 1)
# 1
r.get('mykey')
# b'1'

##################
# Generic
##################

# KEYS pattern
# O(N)
# Returns all keys matching pattern.
r.keys('*')
# [b'mykey', b'mykey2']

# EXPIRE key seconds
# O(1)
# Set a timeout on key. After the timeout has expired, the key will automatically be deleted.
r.expire('mykey', 10)
# True

# SCAN cursor [MATCH pattern] [COUNT count]
# O(1) for every call. O(N) for a complete iteration, including enough command calls for the cursor to return back to 0.
# Iterates the set of keys in the currently selected Redis database.
r.delete('mykey', 'mykey2')
# 2
r.scan(0, match='employee_profile:*')
# (38, [b'employee_profile:viraj', b'employee_profile:terry', b'employee_profile:sheera', b'employee_profile:arun', b'employee_profile:neil', b'employee_profile:pari', b'employee_profile:aaron', b'employee_profile:nike', b'employee_profile:samt', b'employee_profile:simon'])
r.scan(38, match='employee_profile:*')
# (57, [b'employee_profile:nicol', b'employee_profile:akash', b'employee_profile:mano', b'employee_profile:alexa', b'employee_profile:ashu', b'employee_profile:karol', b'employee_profile:carol', b'employee_profile:sunny', b'employee_profile:peter', b'employee_profile:katie'])

# DEL key [key ...]
# O(N)
# Removes the specified keys.
r.delete('employee_profile:viraj', 'employee_profile:terry',
         'employee_profile:sheera')
# 3

# TTL key
# O(1)
# Returns the remaining time to live of a key that has a timeout.
r.ttl('employee_profile:nicol')
# -1

# INFO [section ...]
# O(1)
# Returns information and statistics about the server, with the following sections: server, clients, memory, persistence, stats, replication, cpu, commandstats, latencystats, sentinel, cluster, modules, keyspace, errorstats
r.info('keyspace')
# {'db0': {'keys': 30, 'expires': 0, 'avg_ttl': 0}}

##################
# Hashes
##################

# HSET key field value [field value ...]
# O(N)
# Sets the specified fields to their respective values in the hash stored at key.
r.hset('h_employee_profile:nicol', 'name', 'Nicol')
# 1

# HGETALL key
# O(N)
# Returns all fields and values of the hash stored at key.
r.hgetall('h_employee_profile:nicol')
# {b'name': b'Nicol'}

# HGET key field
# O(1)
# Returns the value associated with field in the hash stored at key.
r.hget('h_employee_profile:nicol', 'name')
# b'Nicol'

##################
# Sorted Sets
##################

# ZADD key score member [score member ...]
# O(log(N))
# Adds all the specified members with the specified scores to the sorted set stored at key.
r.zadd('myzset', {'one': 1, 'two': 2, 'three': 3})
# 3

# ZRANGE key start stop [WITHSCORES]
# O(log(N)+M)
# Returns the specified range of elements in the sorted set stored at key.
r.zrange('myzset', 0, -1, withscores=True)
# [(b'one', 1.0), (b'two', 2.0), (b'three', 3.0)]
r.zrange('myzset', 0, -1)
# [b'one', b'two', b'three']

##################
# Sets
##################

# SADD key member [member ...]
# O(N)
# Add the specified members to the set stored at key.
r.sadd('myset', 'Hello')
# 1

##################
# Lists
##################

# LPOP key [count]
# O(N)
# Removes and returns the first element(s) of the list stored at key.
r.rpush('mylist', 'one', 'two', 'three', 'four', 'five')
# 5
r.lpop('mylist')
# b'one'
r.lpop('mylist', 2)
# [b'two', b'three']

# LRANGE key start stop
# O(S+N)
# Returns the specified elements of the list stored at key.
r.delete('mylist')
# 1
r.rpush('mylist', 'one', 'two', 'three', 'four', 'five')
# 5
r.lrange('mylist', 0, -1)
# [b'one', b'two', b'three', b'four', b'five']
r.lrange('mylist', -3, 2)
# [b'three']

# LPUSH key element [element ...]
# O(N)
# Inserts specified values at the head of the list stored at key.
r.delete('mylist')
# 1
r.lpush('mylist', 'world')
# 1
r.lpush('mylist', 'hello')
# 2
r.lrange('mylist', 0, -1)
# [b'hello', b'world']

##################
# Streams
##################

# XADD key field value [field value ...]
# O(1) for new entries, O(N) when trimming where N is the number of evicted values
# Appends the specified stream entry to the stream at the specified key.
r.xadd('temperatures:us-ny:10007',
       {'temp_f': 87.2, 'pressure': 29.69, 'humidity': 46})
# b'1694448743274-0'
r.xadd('temperatures:us-ny:10007',
       {'temp_f': 83.1, 'pressure': 29.21, 'humidity': 46.5})
# b'1694448811507-0'
r.xadd('temperatures:us-ny:10007',
       {'temp_f': 81.9, 'pressure': 28.37, 'humidity': 43.7})
# b'1694448825114-0'

# XREAD [COUNT count] [BLOCK milliseconds] STREAMS key [key ...] ID [ID ...]
# Read data from one or multiple streams, only returning entries with an ID greater than the last received ID reported by the caller.
r.xread({'temperatures:us-ny:10007': '0-0'})
# [[b'temperatures:us-ny:10007', [(b'1694448743274-0', {b'temp_f': b'87.2', b'pressure': b'29.69', b'humidity': b'46'}), (b'1694448811507-0', {b'temp_f': b'83.1', b'pressure': b'29.21', b'humidity': b'46.5'}), (b'1694448825114-0', {b'temp_f': b'81.9', b'pressure': b'28.37', b'humidity': b'43.7'})]]]

##################
# Stack
##################

##################
# JSON
##################

# JSON.SET key path value
# O(M+N) where M is the original size and N is the new size
# Set the JSON value at path in key.
r.json().set('employee_profile:nicol', '.', {
    'name': 'nicol', 'age': 24, 'single': True, 'skills': []})
# True
r.json().set('employee_profile:nicol', '$.name', 'Nicol')
# True

# JSON.GET key [path [path ...]]
# O(N)
# Return the value at path in JSON serialized form
r.json().get('employee_profile:nicol', '.')
# {"name": "Nicol","age": 24,"single": true}

# JSON.ARRAPPEND key [path] value [value ...]
# O(1) for each value added, O(N) for multiple values added where N is the size of the key
# Append the value(s) to the array at path in key after the last element in the array.
r.json().set('employee_profile:nicol', '$.skills', [])
# True
r.json().arrappend('employee_profile:nicol', '$.skills', 'python')
# [1]
r.json().get('employee_profile:nicol', '$.skills')
# [["python"]]

# JSON.ARRINDEX key path value [start [stop]]
# O(N)
# Search for the first occurrence of a JSON value in an array.
r.json().arrindex('employee_profile:nicol', '$.skills', 'python')
# [0]
r.json().arrindex('employee_profile:nicol', '$.skills', 'java')
# [-1]

##################
# Search and Query
##################

try:
    r.ft('idx-employees').dropindex()
except:
    pass

# FT.CREATE index [ON HASH | JSON] [PREFIX count prefix [prefix ...]] SCHEMA field_name [AS alias] TEXT | TAG | NUMERIC | GEO | VECTOR | GEOSHAP [SORTABLE [UNF]] [NOINDEX] [ field_name [AS alias] TEXT | TAG | NUMERIC | GEO | VECTOR | GEOSHAPE [ SORTABLE [UNF]] [NOINDEX] ...]
# O(K) where K is the number of fields in the document, O(N) for keys in the keyspace
# Creates a new search index with the given specification.
schema = (TextField('$.name', as_name='name', sortable=True), NumericField('$.age', as_name='age', sortable=True),
          TagField('$.single', as_name='single'), TagField('$.skills[*]', as_name='skills'))

r.ft('idx-employees').create_index(schema, definition=IndexDefinition(
    prefix=['employee_profile:'], index_type=IndexType.JSON))
# b'OK'

# FT.INFO index
# O(1)
# Return information and statistics on the index.
r.ft('idx-employees').info()
# ...

# FT.SEARCH index query
# O(N)
# Search the index with a textual query, returning either documents or just ids
r.ft('idx-employees').search('Nicol')
# Result{1 total, docs: [Document {'id': 'employee_profile:nicol', 'payload': None, 'json': '{"name":"Nicol","age":24,"single":true,"skills":[]}'}]}

r.ft('idx-employees').search("@single:{false}")
# Result{7 total, docs: [Document {'id': 'employee_profile:sam', 'payload': None, 'json': '{"name":"sam","age":41,"single":false,"skills":[]}'}, Document {'id': 'employee_profile:cherry', 'payload': None, 'json': '{"name":"cherry","age":49,"single":false,"skills":[]}'}, Document {'id': 'employee_profile:akash', 'payload': None, 'json': '{"name":"akash","age":70,"single":false,"skills":[]}'}, Document {'id': 'employee_profile:saint', 'payload': None, 'json': '{"name":"saint","age":43,"single":false,"skills":[]}'}, Document {'id': 'employee_profile:peter', 'payload': None, 'json': '{"name":"peter","age":43,"single":false,"skills":[]}'}, Document {'id': 'employee_profile:nike', 'payload': None, 'json': '{"name":"nike","age":46,"single":false,"skills":[]}'}, Document {'id': 'employee_profile:alexa', 'payload': None, 'json': '{"name":"alexa","age":45,"single":false,"skills":[]}'}]}

r.ft('idx-employees').search("@skills:{python}")
# Result{1 total, docs: [Document {'id': 'employee_profile:nicol', 'payload': None, 'json': '{"name":"Nicol","age":24,"single":true,"skills":["python"]}'}]}

r.ft('idx-employees').search(Query("*").add_filter(NumericFilter('age', 30, 40)))
# Result{2 total, docs: [Document {'id': 'employee_profile:carol', 'payload': None, 'json': '{"name":"carol","age":40,"single":true,"skills":[]}'}, Document {'id': 'employee_profile:solomon', 'payload': None, 'json': '{"name":"solomon","age":30,"single":true,"skills":[]}'}]}

r.json().arrappend('employee_profile:karol', '$.skills', 'python', 'java', 'c#')
# [3]

r.ft('idx-employees').search(Query("@skills:{java}, @skills:{python}"))
# Result{1 total, docs: [Document {'id': 'employee_profile:karol', 'payload': None, 'json': '{"name":"karol","age":23,"single":true,"skills":["python","java","c#"]}'}]}

# FT.AGGREGATE index query
# O(1)
# Run a search query on an index, and perform aggregate transformations on the results, extracting statistics etc from them
r.ft('idx-employees').aggregate(aggregations.AggregateRequest("*").group_by('@age',
                                                                            reducers.count().alias('count')).sort_by("@age")).rows
# [[b'age', b'14', b'count', b'1'], [b'age', b'15', b'count', b'1'], [b'age', b'20', b'count', b'1'], [b'age', b'23', b'count', b'3'], [b'age', b'24', b'count', b'1'], [b'age', b'30', b'count', b'1'], [b'age', b'40', b'count', b'1'], [b'age', b'41', b'count', b'2'], [b'age', b'42', b'count', b'1'], [b'age', b'43', b'count', b'4']]

r.ft('idx-employees').aggregate(aggregations.AggregateRequest("@skills:{python}").group_by('@skills',
                                                                                           reducers.tolist('@name').alias('names'))).rows
# [[b'skills', b'["python","java","c#"]', b'names', [b'karol']], [b'skills', b'["python"]', b'names', [b'Nicol']]]

##################
# Triggers and Functions
##################

# TFUNCTION LOAD "<library-code>"
# O(1)
# Load a new JavaScript library into Redis.
r.tfunction_load(
    "#!js api_version=1.0 name=cheatSheet\n redis.registerFunction('hello', (client, data)=>{return `Hello ${JSON.parse(data).name}`})", replace=True)
# b'OK'
r.tfunction_list(verbose=1)
# [[b'api_version', b'1.0', b'cluster_functions', [], b'configuration', None, b'engine', b'js', b'functions', [[b'description', None, b'flags', [], b'is_async', 0, b'name', b'hello']], b'keyspace_triggers', [], b'name', b'lib', b'pending_async_calls', [], b'pending_jobs', 0, b'stream_triggers', [], b'user', b'default']]

# TFCALL <function-name> <key> <args...>
# Invoke a function.
person = {'name': 'Nicol'}
args = json.dumps(person).encode('utf-8')
r.tfcall('cheatSheet', 'hello', None, args)
