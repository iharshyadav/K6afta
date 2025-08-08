import kafkaConfig from "../config/kafka.config";
import { PostModel } from "../models/create-post.model";

export const postConsumer = async () => {
    const messages : any[] = [];
    let isProcessing = false;

    try {
        await kafkaConfig.subscribeToTopic("post");

        await kafkaConfig.consume(async (message) => {
            console.log("Message added to queue:", message);
            messages.push(message);
           if(messages.length > 100){
            processMessages();
           }
        });

        setInterval(processMessages, 5000);
    } catch (error) {
        console.error("Error in post consumer:", error);
    }

    async function processMessages() {
        if(messages.length > 0 && !isProcessing){

            isProcessing = true;
            const batchProcess = [...messages];
            messages.length = 0;

            try {
                await PostModel.insertMany(batchProcess);
            } catch (error) {
                console.error("Error saving posts to DB:", error);
                messages.push(...batchProcess);
            }finally{
                isProcessing = false;
            }
        }
    }

}