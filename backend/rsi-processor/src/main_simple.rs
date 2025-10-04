use kafka::consumer::{Consumer, FetchOffset, GroupOffsetStorage};
use kafka::producer::{Producer, Record, RequiredAcks};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

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

fn main() {
    let mut consumer = Consumer::from_hosts(vec!["127.0.0.1:9092".to_owned()])
        .with_topic("trade-data".to_owned())
        .with_group("rust-rsi-group".to_owned())
        .with_fallback_offset(FetchOffset::Earliest)
        .with_offset_storage(GroupOffsetStorage::Kafka)
        .create()
        .expect("Failed to create consumer");

    let mut producer = Producer::from_hosts(vec!["127.0.0.1:9092".to_owned()])
        .with_ack_timeout(Duration::from_secs(1))
        .with_required_acks(RequiredAcks::One)
        .create()
        .expect("Failed to create producer");

    println!("✅ Rust RSI Processor started. Waiting for trade-data...");

    let mut token_prices: HashMap<String, Vec<f64>> = HashMap::new();

    loop {
        for ms in consumer.poll().unwrap().iter() {
            for m in ms.messages() {
                if let Ok(payload) = std::str::from_utf8(m.value) {
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
                            let _ = producer.send(&Record::from_value("rsi-data", payload));

                            println!("📊 Sent RSI: {:?}", result);
                        }
                    }
                }
            }
            consumer.consume_messageset(ms).unwrap();
        }
        consumer.commit_consumed().unwrap();
    }
}