import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "us-east-1" });

const QUEUE_URL = process.env.SQS_QUEUE_URL!;

export const sendToEmailQueue = async (
  to: string,
  leadName: string,
  analysis: any
) => {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ to, leadName, analysis }),
  });

  await sqs.send(command);
  console.log(`Email job queued for ${to}`);
};