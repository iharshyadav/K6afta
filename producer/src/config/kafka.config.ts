import { Admin, Kafka, logLevel, Producer } from "kafkajs";

class KafkaConfig {
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private broker: string;

  constructor() {
    this.broker = process.env.KAFKA_BROKER!;
    this.kafka = new Kafka({
      clientId: "producer",
      brokers: [this.broker],
      logLevel: logLevel.ERROR,
    });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.admin.connect();
      console.log("Connected to Kafka", this.broker);
    } catch (error) {
      console.error("Error connecting to Kafka", error);
    }
  }

  async createTopic(topic: string): Promise<void> {
    try {
      await this.admin.createTopics({
        topics: [{ topic , numPartitions: 1 }],
      });
      console.log(`Topic created: ${topic}`);
    } catch (error) {
      console.error("Error creating topic", error);
    }
  }

  async sendToTopic(topic: string, message: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: message }],
      });
      console.log(`Message sent to topic ${topic}: ${message}`);
    } catch (error) {
      console.error("Error sending message to topic", error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.admin.disconnect();
      console.log("Disconnected from Kafka");
    } catch (error) {
      console.error("Error disconnecting from Kafka", error);
    }
  }

}

export default new KafkaConfig();
