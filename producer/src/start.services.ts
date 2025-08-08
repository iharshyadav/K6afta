import kafkaConfig from "./config/kafka.config";

export const init = async () => {
    try {
        await kafkaConfig.connect();
        await kafkaConfig.createTopic("post");
        // await kafkaConfig.sendToTopic("test-topic", "Hello Kafka");
    } catch (error) {
        console.error("Error initializing Kafka", error);
        process.exit(1);
    }
};
