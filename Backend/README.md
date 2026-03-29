# RFO Backend Project

A simple Spring Boot + MyBatis + MySQL backend project with subject management

## Technology Stack

- **Java**: JDK 17
- **Framework**: Spring Boot 3.5.5
- **Database**: MySQL 8.0
- **ORM**: MyBatis 3.0.5
- **Build Tool**: Maven
- **Testing**: JUnit
- **Port**: 8076

## Project Structure

```
src/main/java/com/unimelb/swen90007/rfo/
├── common/                 # Common classes
│   ├── Result.java        # Unified response result
│   ├── PageResult.java    # Pagination response result
│   ├── PageRequest.java   # Pagination request parameters
│   ├── BusinessException.java      # Business exception
│   ├── GlobalExceptionHandler.java # Global exception handler
│   └── MyMapper.java      # Common Mapper base interface
├── config/                # Configuration classes
│   ├── MyBatisConfig.java # MyBatis configuration
│   └── WebConfig.java     # Web configuration
├── controller/            # Controller layer
│   └── SubjectController.java
├── service/               # Service layer
│   ├── SubjectService.java
│   └── impl/              # Service implementations
│       └── SubjectServiceImpl.java
├── dao/                   # Data access layer
│   └── SubjectDao.java
├── pojo/                  # Entity classes
│   ├── dto/               # Data Transfer Objects
│   │   ├── SubjectCreateDTO.java
│   │   ├── SubjectUpdateDTO.java
│   │   ├── SubjectDeleteDTO.java
│   │   ├── SubjectGetDTO.java
│   │   ├── SubjectBatchDeleteDTO.java
│   │   └── SubjectQueryDTO.java
│   ├── po/                # Persistent Objects
│   │   └── SubjectPO.java
│   └── vo/                # View Objects
│       └── SubjectVO.java
├── util/                  # Utility classes
│   ├── StringUtils.java
│   ├── DateUtils.java
│   ├── JsonUtils.java
│   └── BeanUtils.java
└── RfoApplication.java    # Main application class

src/main/resources/
├── mapper/                # MyBatis mapping files
│   └── SubjectDao.xml
├── sql/                   # SQL scripts
│   └── init.sql
└── application.properties # Configuration file
```

## Features

### Subject Management
- Subject CRUD operations
- Subject name uniqueness check
- Pagination support
- Search functionality

## API Endpoints

### Subject APIs
- `POST /api/subjects/create` - Create subject
- `POST /api/subjects/update` - Update subject
- `POST /api/subjects/delete` - Delete subject
- `POST /api/subjects/get` - Get subject by ID
- `POST /api/subjects/search` - Search subjects with pagination
- `POST /api/subjects/list` - Get all subjects
- `POST /api/subjects/batch-delete` - Batch delete subjects

## Quick Start

### 1. Prerequisites
- JDK 17+
- MySQL 8.0+
- Maven 3.6+

### 2. Database Setup
1. Create database:
```sql
CREATE DATABASE rfo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Execute initialization script:
```bash
mysql -u root -p rfo_db < src/main/resources/sql/init.sql
```

### 3. Configuration
Edit `src/main/resources/application.properties`:
```properties
# Update database connection information
spring.datasource.url=jdbc:mysql://localhost:3306/rfo_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Run Project
```bash
# Compile project
mvn clean compile

# Run project
mvn spring-boot:run
```

### 5. Access APIs
After starting, access: `http://localhost:8076`

## API Testing

### Test Subject Creation
```bash
curl -X POST "http://localhost:8076/api/subjects/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mathematics",
    "description": "Advanced mathematics and calculus"
  }'
```

### Test Get All Subjects
```bash
curl -X POST "http://localhost:8076/api/subjects/list" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test Search Subjects
```bash
curl -X POST "http://localhost:8076/api/subjects/search" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "math",
    "pageNum": 1,
    "pageSize": 10
  }'
```

## Development Notes

### 1. Code Standards
- Use Lombok to reduce boilerplate code
- Unified exception handling
- Unified response format
- Parameter validation

### 2. Database Design
- Use auto-increment primary keys
- Add create and update timestamps
- Use appropriate field types and lengths
- Add necessary indexes

### 3. Security Considerations
- Parameter validation
- SQL injection protection
- CORS configuration

## License

MIT License