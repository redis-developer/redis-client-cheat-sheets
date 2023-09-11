import redis

r = redis.Redis(host='localhost', port=6379, db=0)

##################
# Core Commands
##################

##################
## Strings
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
## Generic
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
r.flushall()
# True
# Bulk upload employee.redis
r.scan(0, match='employee_profile:*')
# (38, [b'employee_profile:viraj', b'employee_profile:terry', b'employee_profile:sheera', b'employee_profile:arun', b'employee_profile:neil', b'employee_profile:pari', b'employee_profile:aaron', b'employee_profile:nike', b'employee_profile:samt', b'employee_profile:simon'])
r.scan(38, match='employee_profile:*')
# (57, [b'employee_profile:nicol', b'employee_profile:akash', b'employee_profile:mano', b'employee_profile:alexa', b'employee_profile:ashu', b'employee_profile:karol', b'employee_profile:carol', b'employee_profile:sunny', b'employee_profile:peter', b'employee_profile:katie'])

# DEL key [key ...]
# O(N)
# Removes the specified keys.
r.delete('employee_profile:viraj', 'employee_profile:terry', 'employee_profile:sheera')
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
## Hashes
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
## Sorted Sets
##################
