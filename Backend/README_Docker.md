# Docker Setup for RFO Backend

This guide explains how to run the RFO backend project with MySQL using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

### System Requirements
- **Windows**: Docker Desktop for Windows
- **macOS**: Docker Desktop for Mac
- **Linux**: Docker Engine + Docker Compose

### Installation Links
- Windows: https://docs.docker.com/desktop/windows/install/
- macOS: https://docs.docker.com/desktop/mac/install/
- Linux: https://docs.docker.com/engine/install/

## Quick Start

### 1. Using Docker Compose (Recommended)

**First time setup:**
```bash
# Start MySQL database
docker-compose up -d

# Check if container is running
docker-compose ps

# View logs
docker-compose logs mysql
```

**Subsequent starts (if container already exists):**
```bash
# Check container status first
docker-compose ps

# If container is stopped, start it
docker-compose start

# If container is running, no action needed
# If you need to restart the container
docker-compose restart
```

**If you modified Dockerfile or docker-compose.yml:**
```bash
# Stop and remove existing containers
docker-compose down -v

# Choose ONE of the following options:

# Option 1: Normal rebuild (recommended)
docker-compose up -d --build

# Option 2: Force rebuild without cache (if you have issues)
docker-compose up -d --build --force-recreate
```

### 2. Using Docker directly

```bash
# Build the image
docker build -t rfo-mysql .

# Run the container
docker run -d \
  --name rfo-mysql \
  -p 3307:3307 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=rfo_db \
  -e MYSQL_USER=rfo_user \
  -e MYSQL_PASSWORD=rfo_password \
  rfo-mysql
```

## Database Configuration

The Docker setup creates a MySQL database with the following configuration:

- **Host**: localhost
- **Port**: 3307
- **Database**: rfo_db
- **Root Password**: 123456
- **User**: rfo_user
- **User Password**: rfo_password

## Application Configuration

Update your `application.properties` to use the Docker MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3307/rfo_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Australia/Melbourne&allowPublicKeyRetrieval=true
spring.datasource.username=rfo_user
spring.datasource.password=rfo_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

## Daily Usage Guide

### Container Lifecycle Management

**First time (create and start):**
```bash
docker-compose up -d
```

**Daily start (if container exists but stopped):**
```bash
# Check status first
docker-compose ps

# Start if stopped
docker-compose start
```

**After modifying Dockerfile or docker-compose.yml:**
```bash
# Method 1: Rebuild and restart
docker-compose up -d --build

# Method 2: Complete rebuild (recommended for major changes)
docker-compose down
docker-compose up -d --build

# Method 3: Force rebuild without cache
docker-compose up -d --build --force-recreate
```

**When you're done for the day:**
```bash
# Stop containers (data preserved)
docker-compose stop

# Or completely remove (data still preserved in volumes)
docker-compose down
```

## Useful Commands

### Start/Stop Services
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Database Management
```bash
# Connect to MySQL container
docker exec -it rfo-mysql mysql -u root -p

# Connect with user account
docker exec -it rfo-mysql mysql -u rfo_user -p rfo_db

# View database
docker exec -it rfo-mysql mysql -u root -p -e "SHOW DATABASES;"

# View tables
docker exec -it rfo-mysql mysql -u root -p -e "USE rfo_db; SHOW TABLES;"
```

### Logs and Debugging
```bash
# View container logs
docker-compose logs mysql

# Follow logs in real-time
docker-compose logs -f mysql

# View container status
docker-compose ps

# Inspect container
docker inspect rfo-mysql
```

## Data Persistence

The MySQL data is persisted in a Docker volume named `mysql_data`. This means your data will survive container restarts and rebuilds.

To completely reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

## Quick Reference

### Common Scenarios

| Scenario | Command | Description |
|----------|---------|-------------|
| **First time setup** | `docker-compose up -d` | Create and start container |
| **Daily start** | `docker-compose start` | Start existing stopped container |
| **Check status** | `docker-compose ps` | See if container is running |
| **Modified Dockerfile** | `docker-compose up -d --build` | Rebuild and restart |
| **Major changes** | `docker-compose down && docker-compose up -d --build` | Complete rebuild |
| **Stop for the day** | `docker-compose stop` | Stop but keep container |
| **Complete cleanup** | `docker-compose down -v` | Remove everything including data |
| **View logs** | `docker-compose logs mysql` | Check container logs |
| **Restart service** | `docker-compose restart` | Restart running container |

### When to Use Each Command

**`docker-compose up -d`:**
- First time setup
- After `docker-compose down`
- When you want to ensure container is running

**`docker-compose start`:**
- Container exists but is stopped
- Daily startup routine
- Quickest way to start existing container

**`docker-compose up -d --build`:**
- Modified Dockerfile
- Modified docker-compose.yml
- Need to apply configuration changes

**`docker-compose down`:**
- End of work session
- Need to free up resources
- Before making major changes

## Troubleshooting

### Port Already in Use
If port 3306 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3307:3306"  # Use port 3307 instead
```

### Permission Issues
**Linux/macOS:**
```bash
sudo chown -R $USER:$USER .
```

**Windows:**
- Run Command Prompt as Administrator
- Or use PowerShell with elevated privileges

### Container Won't Start
Check logs for errors:
```bash
docker-compose logs mysql
```

### System-Specific Issues

**Windows:**
- Ensure Docker Desktop is running
- Check if Hyper-V is enabled
- Use PowerShell or Command Prompt

**macOS:**
- Ensure Docker Desktop is running
- Check system resources (RAM/CPU)

**Linux:**
- Ensure Docker daemon is running: `sudo systemctl start docker`
- Add user to docker group: `sudo usermod -aG docker $USER`
- Logout and login again after adding to docker group

## Production Considerations

For production use, consider:

1. **Change default passwords**
2. **Use environment variables for sensitive data**
3. **Enable SSL/TLS**
4. **Set up proper backup strategies**
5. **Use Docker secrets for passwords**

Example production docker-compose.yml:
```yaml
version: '3.8'
services:
  mysql:
    build: .
    container_name: rfo-mysql-prod
    restart: unless-stopped
    ports:
      - "3307:3307"
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql_root_password
      MYSQL_DATABASE: rfo_db
      MYSQL_USER: rfo_user
      MYSQL_PASSWORD_FILE: /run/secrets/mysql_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./src/main/resources/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    secrets:
      - mysql_root_password
      - mysql_password

secrets:
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  mysql_password:
    file: ./secrets/mysql_password.txt

volumes:
  mysql_data:
```
