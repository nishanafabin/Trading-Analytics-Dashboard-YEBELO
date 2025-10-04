use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::Message;
use rdkafka::config::ClientConfig;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio_stream::StreamExt;

#[derive(Debug, Deserialize)]
struct Trade {
    token_address: String,
    price_in_sol: f64,
    block_time: i64,
}

#[derive(Debug, Serialize)]
struct RSIResult {
    token_address: String,
    rsi: f64,
    timestamp: i64,
}

// Simple RSI calculation
fn calculate_rsi(prices: &Vec<f64>, period: usize) -> Option<f64> {
    if prices.len() < period + 1 {
        return None;
    }

    let mut gains = 0.0;
    let mut losses = 0.0;

    for i in 1..=period {
        let change = prices[i] - prices[i - 1];
        if change > 0.0 {
            gains += change;
        } else {
            losses -= change;
        }
    }

    let avg_gain = gains / period as f64;
    let avg_loss = losses / period as f64;

    if avg_loss == 0.0 {
        return Some(100.0);
    }

    let rs = avg_gain / avg_loss;
    Some(100.0 - (100.0 / (1.0 + rs)))
}

#[tokio::main]
async fn main() {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "rust-rsi-group")
        .set("bootstrap.servers", "127.0.0.1:9092")
        .create()
        .expect("Consumer creation failed");

    consumer
        .subscribe(&["trade-data"])
        .expect("Can't subscribe to topic");

    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", "127.0.0.1:9092")
        .create()
        .expect("Producer creation failed");

    println!("✅ Rust RSI Processor started. Waiting for trade-data...");

    let mut token_prices: HashMap<String, Vec<f64>> = HashMap::new();
    let mut stream = consumer.stream();

    while let Some(message) = stream.next().await {
        match message {
            Ok(m) => {
                if let Some(Ok(payload)) = m.payload_view::<str>() {
                    if let Ok(trade) = serde_json::from_str::<Trade>(payload) {
                        let entry = token_prices
                            .entry(trade.token_address.clone())
                            .or_insert_with(Vec::new);

                        entry.push(trade.price_in_sol);
                        if entry.len() > 15 {
                            entry.remove(0);
                        }

                        if let Some(rsi) = calculate_rsi(entry, 14) {
                            let result = RSIResult {
                                token_address: trade.token_address,
                                rsi: (rsi * 100.0).round() / 100.0,
                                timestamp: chrono::Utc::now().timestamp_millis(),
                            };

                            let payload = serde_json::to_string(&result).unwrap();
                            let _ = producer
                                .send(
                                    FutureRecord::to("rsi-data")
                                        .payload(&payload)
                                        .key("rsi"),
                                    0,
                                )
                                .await;

                            println!("📊 Sent RSI: {:?}", result);
                        }
                    }
                }
            }
            Err(e) => eprintln!("Kafka error: {}", e),
        }
    }
}
