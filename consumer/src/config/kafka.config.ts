import { Consumer, Kafka, logLevel } from "kafkajs";

class KafkaConfig {
  private kafka: Kafka;
  private consumer: Consumer;
  private broker: string;

  constructor() {
    this.broker = process.env.KAFKA_BROKER!;
    this.kafka = new Kafka({
      clientId: "consumer",
      brokers: [this.broker],
      logLevel: logLevel.ERROR,
    });
    this.consumer = this.kafka.consumer({
      groupId : "post-consumer"
    });
    // this.admin = this.kafka.admin();
  }

  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      // await this.admin.connect();
      console.log("Connected to Kafka", this.broker);
    } catch (error) {
      console.error("Error connecting to Kafka", error);
    }
  }

  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await this.consumer.subscribe({ topic , fromBeginning: true });
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error("Error subscribing to topic", error);
    }
  }

  async consume(callback : (message: any) => void): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          // console.log("message received:", {
          //   topic,
          //   partition,
          //   value: message?.value?.toString(),
          // });
          callback(JSON.parse(message?.value?.toString()!));
        },
      })
    } catch (error) {
      console.error("Error consuming messages", error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      // await this.admin.disconnect();
      console.log("Disconnected from Kafka");
    } catch (error) {
      console.error("Error disconnecting from Kafka", error);
    }
  }

}

export default new KafkaConfig();
