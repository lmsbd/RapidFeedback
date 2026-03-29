#!/bin/bash

echo "=== Custom MySQL Startup Script ==="

# Start MySQL with authentication plugin
# The docker-entrypoint.sh will automatically execute SQL files in /docker-entrypoint-initdb.d/
echo "Starting MySQL server..."
exec docker-entrypoint.sh mysqld --default-authentication-plugin=mysql_native_password