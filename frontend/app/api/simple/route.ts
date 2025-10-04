import { NextRequest, NextResponse } from 'next/server';
import { Kafka } from 'kafkajs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  
  if (!topic || !['trade-data', 'rsi-data'].includes(topic)) {
    return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
  }

  try {
    const kafka = new Kafka({
      clientId: 'simple-consumer',
      brokers: ['127.0.0.1:9092']
    });

    const consumer = kafka.consumer({ groupId: 'simple-group' });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    const messages: any[] = [];
    let messageCount = 0;

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value && messageCount < 50) {
          const data = JSON.parse(message.value.toString());
          messages.push(data);
          messageCount++;
        }
        if (messageCount >= 50) {
          await consumer.stop();
        }
      },
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await consumer.disconnect();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}