use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::config::ClientConfig;
use rdkafka::Message;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio_stream::StreamExt;
use tracing::{info, error};
use anyhow::Result;

#[derive(Debug, Deserialize)]
struct TradeData {
    token_address: String,
    price_in_sol: f64,
    timestamp: i64,
}

#[derive(Debug, Serialize)]
struct RSIData {
    token_address: String,
    rsi: f64,
    timestamp: i64,
    signal: String,
}

struct RSICalculator {
    prices: Vec<f64>,
    period: usize,
}

impl RSICalculator {
    fn new(period: usize) -> Self {
        Self { prices: Vec::new(), period }
    }

    fn add_price(&mut self, price: f64) {
        self.prices.push(price);
        if self.prices.len() > self.period + 1 {
            self.prices.remove(0);
        }
    }

    fn calculate_rsi(&self) -> Option<f64> {
        if self.prices.len() < self.period + 1 {
            return None;
        }

        let mut gains = 0.0;
        let mut losses = 0.0;

        for i in 1..=self.period {
            let change = self.prices[i] - self.prices[i - 1];
            if change > 0.0 {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avg_gain = gains / self.period as f64;
        let avg_loss = losses / self.period as f64;

        if avg_loss == 0.0 {
            return Some(100.0);
        }

        let rs = avg_gain / avg_loss;
        Some(100.0 - (100.0 / (1.0 + rs)))
    }
}

fn get_rsi_signal(rsi: f64) -> String {
    if rsi >= 70.0 {
        "overbought".to_string()
    } else if rsi <= 30.0 {
        "oversold".to_string()
    } else {
        "neutral".to_string()
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::init();
    info!("🚀 Starting RSI Processor");

    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "rsi-processor-group")
        .set("bootstrap.servers", "127.0.0.1:9092")
        .set("auto.offset.reset", "earliest")
        .create()?;

    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", "127.0.0.1:9092")
        .create()?;

    consumer.subscribe(&["trade-data"])?;
    info!("✅ Subscribed to trade-data topic");

    let mut rsi_calculators: HashMap<String, RSICalculator> = HashMap::new();
    let mut message_stream = consumer.stream();

    while let Some(message) = message_stream.next().await {
        match message {
            Ok(m) => {
                if let Some(payload) = m.payload() {
                    match serde_json::from_slice::<TradeData>(payload) {
                        Ok(trade) => {
                            let calculator = rsi_calculators
                                .entry(trade.token_address.clone())
                                .or_insert_with(|| RSICalculator::new(14));

                            calculator.add_price(trade.price_in_sol);

                            if let Some(rsi) = calculator.calculate_rsi() {
                                let rsi_data = RSIData {
                                    token_address: trade.token_address.clone(),
                                    rsi: (rsi * 100.0).round() / 100.0,
                                    timestamp: chrono::Utc::now().timestamp_millis(),
                                    signal: get_rsi_signal(rsi),
                                };

                                let rsi_json = serde_json::to_string(&rsi_data)?;
                                
                                match producer.send(
                                    FutureRecord::to("rsi-data")
                                        .key(&trade.token_address)
                                        .payload(&rsi_json),
                                    std::time::Duration::from_secs(0),
                                ).await {
                                    Ok(_) => info!("📤 Published RSI: {} = {:.2}", 
                                                 rsi_data.token_address, rsi_data.rsi),
                                    Err(e) => error!("❌ Failed to publish RSI: {:?}", e),
                                }
                            }
                        }
                        Err(e) => error!("⚠️ Failed to parse trade data: {:?}", e),
                    }
                }
            }
            Err(e) => error!("❌ Kafka error: {:?}", e),
        }
    }

    Ok(())
}