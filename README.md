# Scalable API - Producer-Consumer Architecture

A high-performance, scalable API system built with **Node.js**, **Kafka**, **MongoDB**, and **Docker** that demonstrates microservices architecture using producer-consumer pattern for handling high-throughput post creation and processing.

## 🏗️ Architecture Overview

This project implements a **microservices architecture** with the following components:

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │              │    │                 │    │                 │
│   k6 Load Test  │───▶│   Producer   │───▶│     Kafka       │───▶│    Consumer     │
│                 │    │   (Port:3000)│    │   (Port:9092)   │    │   (Port:3001)   │
└─────────────────┘    └──────────────┘    └─────────────────┘    └─────────────────┘
                                                                            │
                                                                            ▼
                                                                   ┌─────────────────┐
                                                                   │                 │
                                                                   │    MongoDB      │
                                                                   │                 │
                                                                   └─────────────────┘
```

### **Producer Service** (Port 3000)
- **Framework**: Hono.js with Bun runtime
- **Purpose**: Receives HTTP POST requests and publishes messages to Kafka
- **Features**: 
  - Input validation with Zod
  - High-performance API endpoints
  - Kafka message publishing

### **Consumer Service** (Port 3001)
- **Framework**: Hono.js with Bun runtime
- **Purpose**: Consumes messages from Kafka and processes them in batches
- **Features**:
  - Batch processing (100 messages or 5-second intervals)
  - MongoDB integration with Mongoose
  - Error handling and retry logic

### **Kafka** (Port 9092)
- **Purpose**: Message broker for asynchronous communication
- **Configuration**: Single-node setup with topic "post"
- **Features**: High-throughput message queuing

### **Load Testing**
- **Tool**: k6
- **Configuration**: 300 virtual users for 5 minutes
- **Thresholds**: 95% requests under 2s, <1% failure rate

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose**
- **Bun** (JavaScript runtime)
- **k6** (Load testing tool)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd scalable-api
```

### 2. Start Kafka with Docker
```bash
docker-compose up -d
```

This will start:
- Kafka broker on port 9092
- Kafka controller on port 9093

### 3. Set Environment Variables

#### Producer (.env in producer directory)
```env
KAFKA_BROKER=localhost:9092
```

#### Consumer (.env in consumer directory)
```env
KAFKA_BROKER=localhost:9092
MONGO_URI=mongodb://localhost:27017/scalable-api
```

### 4. Install Dependencies

#### For Producer
```bash
cd producer
bun install
```

#### For Consumer
```bash
cd consumer
bun install
```

### 5. Start MongoDB
Make sure MongoDB is running locally or update the `MONGO_URI` to point to your MongoDB instance.

### 6. Start the Services

#### Terminal 1 - Start Producer
```bash
cd producer
bun run dev
```
Producer will start on `http://localhost:3000`

#### Terminal 2 - Start Consumer
```bash
cd consumer
bun run dev
```
Consumer will start on `http://localhost:3001`

### 7. Run Load Tests
```bash
cd producer
k6 run test.js
```

## 📁 Project Structure

```
scalable-api/
├── producer/                    # Producer service
│   ├── src/
│   │   ├── config/
│   │   │   └── kafka.config.ts  # Kafka producer configuration
│   │   ├── services/
│   │   │   └── create-post.ts   # Post creation endpoint
│   │   ├── index.ts            # Main application entry
│   │   └── start.services.ts   # Service initialization
│   ├── test.js                 # k6 load test configuration
│   └── package.json
├── consumer/                   # Consumer service
│   ├── src/
│   │   ├── config/
│   │   │   ├── kafka.config.ts # Kafka consumer configuration
│   │   │   └── db.config.ts    # MongoDB configuration
│   │   ├── models/
│   │   │   └── create-post.model.ts # Post schema definition
│   │   ├── services/
│   │   │   └── post.consumer.ts # Message processing logic
│   │   ├── index.ts           # Main application entry
│   │   └── start.services.ts  # Service initialization
│   └── package.json
├── docker-compose.yml         # Kafka container configuration
└── README.md                 # This file
```

## 🔧 Detailed Component Breakdown

### Producer Service Details

#### **API Endpoints**
- `GET /` - Health check endpoint
- `POST /create-post` - Create a new post

#### **POST /create-post Request Body**
```json
{
  "title": "My Post Title",
  "content": "This is the post content with minimum 10 characters"
}
```

#### **Validation Rules**
- `title`: String, 2-100 characters
- `content`: String, 10-1000 characters

#### **Response Format**
```json
{
  "message": "Post created successfully"
}
```

#### **Error Handling**
- Returns 400 for validation errors
- Returns 500 for Kafka publishing errors

### Consumer Service Details

#### **Processing Strategy**
The consumer uses **batch processing** for optimal performance:
- **Batch Size**: 100 messages OR 5-second intervals (whichever comes first)
- **Concurrency**: Single-threaded processing to avoid race conditions
- **Error Recovery**: Failed batches are retried

#### **Processing Flow**
1. Subscribe to "post" topic in Kafka
2. Collect messages in an in-memory queue
3. Process in batches when:
   - Queue reaches 100 messages, OR
   - 5 seconds have elapsed since last processing
4. Insert batch into MongoDB using `insertMany()`
5. Clear processed messages from queue

### Kafka Configuration

#### **Producer Configuration**
- **Client ID**: "producer"
- **Topic**: "post"
- **Partitions**: 1 (single partition for ordered processing)
- **Replication Factor**: 1 (single broker setup)

#### **Consumer Configuration**
- **Client ID**: "consumer"
- **Group ID**: "post-consumer"
- **Topic**: "post"
- **From Beginning**: true (processes all messages from start)

### Database Schema

#### **Post Model (MongoDB)**
```typescript
interface Post {
  title: string;    // Required, 2-100 chars
  content: string;  // Required, 10-1000 chars
}
```

## 📊 Performance Testing

### k6 Load Test Configuration

```javascript
export const options = {
  scenarios: {
    load_test: {
      executor: 'constant-vus',
      vus: 300,           // 300 virtual users
      duration: '5m',     // Run for 5 minutes
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% under 2s
    http_req_failed: ['rate<0.01'],      // <1% failure rate
  },
};
```

### Expected Performance Results
- **Throughput**: ~300 requests/second
- **Response Time**: 95th percentile under 2 seconds
- **Success Rate**: >99%
- **Total Requests**: ~89,100 requests in 5 minutes

## 🛠️ Development Commands

### Producer Commands
```bash
# Development mode (hot reload)
bun run dev

# Run load tests
bun run start  # Equivalent to: k6 run test.js
```

### Consumer Commands
```bash
# Development mode (hot reload)
bun run dev
```

### Docker Commands
```bash
# Start Kafka
docker-compose up -d

# Stop Kafka
docker-compose down

# View Kafka logs
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka
```

## 🔍 Monitoring and Debugging

### Application Logs
Both services provide detailed logging for:
- Kafka connection status
- Message processing
- Database operations
- Error conditions

### Key Log Messages
- `"Connected to Kafka"` - Successful Kafka connection
- `"Topic created: post"` - Topic initialization
- `"Message sent to topic"` - Successful message publishing
- `"Message added to queue"` - Consumer receiving messages
- `"MongoDB connected successfully"` - Database connection

### Debugging Tips
1. **Kafka Connection Issues**: Check if Docker containers are running
2. **Message Not Processing**: Verify consumer is subscribed to correct topic
3. **Database Errors**: Ensure MongoDB is running and accessible
4. **Load Test Failures**: Confirm both services are running before testing

## 🏭 Production Considerations

### Scaling Strategies
1. **Horizontal Scaling**: Deploy multiple producer/consumer instances
2. **Kafka Partitioning**: Increase partitions for parallel processing
3. **Database Optimization**: Add indexes, use replica sets
4. **Load Balancing**: Use reverse proxy for producer instances

### Security Enhancements
1. **Authentication**: Add API keys or JWT tokens
2. **Rate Limiting**: Implement request rate limiting
3. **Input Sanitization**: Enhanced validation and sanitization
4. **Network Security**: Use HTTPS, VPN, firewalls

### Monitoring
1. **Application Metrics**: Request rates, error rates, response times
2. **Kafka Metrics**: Consumer lag, message throughput
3. **Database Metrics**: Connection pool, query performance
4. **Infrastructure**: CPU, memory, disk usage

## 🧪 Testing

### Unit Tests
```bash
# Add your test framework
bun test
```

### Integration Tests
Test the complete flow:
1. Send POST request to producer
2. Verify message in Kafka topic
3. Confirm data in MongoDB

### Performance Tests
Use k6 for various scenarios:
- Burst traffic
- Sustained load
- Gradual ramp-up

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

#### 1. Kafka Connection Failed
```bash
# Check if Kafka is running
docker-compose ps

# Restart Kafka
docker-compose restart kafka
```

#### 2. Consumer Not Processing Messages
- Verify topic exists: Check producer logs for "Topic created"
- Check consumer group: Ensure unique group ID
- Verify broker URL in environment variables

#### 3. MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string format
- Verify network connectivity

#### 4. k6 Command Not Found
```bash
# Install k6 on Windows
winget install k6

# Install k6 on macOS
brew install k6

# Install k6 on Linux
sudo apt install k6
```

## 📈 Performance Optimization Tips

1. **Batch Size Tuning**: Adjust batch size based on your use case
2. **Connection Pooling**: Configure optimal pool sizes
3. **Memory Management**: Monitor memory usage in long-running processes
4. **Kafka Optimization**: Tune batch.size and linger.ms for throughput
5. **MongoDB Optimization**: Use appropriate write concerns and indexes

---

**Built with ❤️ using modern technologies for maximum performance and scalability.**
