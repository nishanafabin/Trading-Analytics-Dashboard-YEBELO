import { NextRequest, NextResponse } from 'next/server';
import KafkaManager from '../../lib/kafka-manager';

// Initialize Kafka consumer on server startup
const kafkaManager = KafkaManager.getInstance();
kafkaManager.initialize().catch(console.error);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  
  if (!topic) {
    return NextResponse.json({ error: 'Topic parameter required' }, { status: 400 });
  }

  if (!['trade-data', 'rsi-data'].includes(topic)) {
    return NextResponse.json({ error: 'Invalid topic' }, { status: 400 });
  }

  try {
    const messages = kafkaManager.getMessages(topic);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
