#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <LiquidCrystal_I2C.h>

// --- Configuration ---
const char* serverName = "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1/action/insertOne";
const char* apiKey = "YOUR_MONGODB_API_KEY";

LiquidCrystal_I2C lcd(0x27, 16, 2);
#define RE_DE 4 
#define RX2 16
#define TX2 17

const byte nitro_hex[] = {0x01, 0x03, 0x00, 0x1E, 0x00, 0x01, 0xE4, 0x0C};  
const byte phos_hex[]  = {0x01, 0x03, 0x00, 0x1F, 0x00, 0x01, 0xB5, 0xCC};
const byte potas_hex[] = {0x01, 0x03, 0x00, 0x20, 0x00, 0x01, 0x85, 0xC0};

class Plant {
  private:
    int relay, dhtPin, soil;
    String name;
    DHT dht;

  public:
    Plant *next = NULL;
    
    Plant(String n, int r_pin, int d_pin, int s_pin) 
      : name(n), relay(r_pin), dhtPin(d_pin), soil(s_pin), dht(d_pin, DHT22) {}

    void begin() {
      pinMode(relay, OUTPUT);
      pinMode(soil, INPUT);
      digitalWrite(relay, HIGH); // Start with relay OFF (High for most modules)
      dht.begin();
    }

    void process(int n, int p, int k) {
      float h = dht.readHumidity();
      float t = dht.readTemperature();
      int s = analogRead(soil);

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print(name + " T:" + String(t,0) + " S:" + String(s));
      lcd.setCursor(0, 1);
      lcd.print("N:" + String(n) + " P:" + String(p) + " K:" + String(k));
      
      send_to_db(t, h, s, n, p, k);
      delay(3000); 
    }

    void send_to_db(float t, float h, int s, int n, int p, int k) {
      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("api-key", apiKey);

        String json = "{\"dataSource\":\"Cluster0\",\"database\":\"Garden\",\"collection\":\"Sensors\",\"document\":{";
        json += "\"plant\":\"" + name + "\",";
        json += "\"temp\":" + String(t) + ",\"hum\":" + String(h) + ",";
        json += "\"soil\":" + String(s) + ",\"n\":" + String(n) + ",";
        json += "\"p\":" + String(p) + ",\"k\":" + String(k) + "}}";

        http.POST(json);
        http.end();
      }
    }
};

// Global NPK function using the simpler readBytes method
int getModbusValue(const byte cmd[]) {
  digitalWrite(RE_DE, HIGH);
  delay(10);
  Serial2.write(cmd, 8);
  Serial2.flush();
  digitalWrite(RE_DE, LOW);
  
  delay(100);
  if (Serial2.available() >= 7) {
    byte res[7];
    Serial2.readBytes(res, 7);
    return res[4]; 
  }
  return 0;
}

// Plant data array
int plants_data[3][3] = {
  {19, 26, 32}, // p1
  {33, 27, 34}, // p2
  {25, 18, 35}  // p3
};

Plant* head = NULL;

void connectToWiFi() {
  const char* ssid = "YOUR_WIFI_SSID";
  const char* password = "YOUR_WIFI_PASSWORD";

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  // Timeout logic: try for 20 seconds (40 * 500ms)
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    lcd.setCursor(0,0);
    lcd.print("WiFi Connecting");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected!");
    Serial.println(WiFi.localIP());
    lcd.clear();
    lcd.print("WiFi Connected!");
    delay(1000);
  } else {
    Serial.println("\nFailed to connect. Running in offline mode.");
    lcd.clear();
    lcd.print("WiFi Offline");
    delay(2000);
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RX2, TX2);
  pinMode(RE_DE, OUTPUT);
  lcd.init();
  lcd.backlight();

  // Building the Linked List
  Plant* current = NULL;
  for (int i = 0; i < 3; i++) {
    Plant* newPlant = new Plant("P" + String(i + 1), plants_data[i][0], plants_data[i][1], plants_data[i][2]);
    newPlant->begin();
    
    if (head == NULL) {
      head = newPlant;
      current = head;
    } else {
      current->next = newPlant;
      current = newPlant;
    }
  }
  connectToWiFi();
}

void loop() {
  int n = getModbusValue(nitro_hex);
  int p = getModbusValue(phos_hex);
  int k = getModbusValue(potas_hex);

  // Traverse the Linked List
  Plant* current = head;
  while (current != NULL) {
    current->process(n, p, k);
    current = current->next;
  }
  
  delay(5000); 
}