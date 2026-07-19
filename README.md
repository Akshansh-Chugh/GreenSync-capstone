# Green Sync

![Smart agriculture greenhouse](https://source.unsplash.com/1600x600/?smart-agriculture,greenhouse,iot)

Green Sync is a capstone project for a smart plant monitoring and care system. It combines ESP32-based sensor hardware, KiCad electronics design, and a Node.js backend that manages owners, caretakers, plants, uploaded images, and plant sensor readings.

The project is built as a complete hardware-plus-software prototype for tracking plant health metrics such as soil moisture, temperature, humidity, and NPK nutrient values.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Electronics and Firmware](#electronics-and-firmware)
- [Project Documents](#project-documents)
- [Maintenance Notes](#maintenance-notes)
- [Future Scope](#future-scope)

## Overview

Green Sync focuses on making plant care more measurable and automated. The hardware layer reads plant and environment data, while the backend stores user, plant, caretaker, and reading data for a future web or mobile dashboard.

![IoT plant sensors](https://source.unsplash.com/1200x500/?soil-moisture,sensor,plant,iot)

The repository currently includes:

- Express.js backend APIs for owners, caretakers, plants, and readings.
- MongoDB/Mongoose models for application data.
- Docker Compose setup for a five-node MongoDB replica set.
- ESP32 firmware for WiFi-based plant telemetry.
- KiCad PCB and schematic files.
- Draw.io architecture/design files.
- Capstone proposal, midterm, and final report documents.
- CAD part files for the physical prototype.

## Features

- Owner registration, login, update, logout, deletion, and password/profile management.
- Caretaker creation and plant sharing workflow support.
- Plant creation and deletion with image upload support.
- Sensor reading ingestion endpoint for plant telemetry.
- JWT-protected routes for authenticated actions.
- Cloudinary integration for image storage.
- Multer-based multipart file upload handling.
- Redis configuration support.
- MongoDB replica set for local database development.
- ESP32 firmware for DHT, soil moisture, relay, LCD, and NPK sensor integration.

## Architecture

```mermaid
flowchart LR
    Sensors["Plant Sensors<br/>DHT, soil moisture, NPK"] --> ESP32["ESP32 Firmware"]
    ESP32 --> LCD["I2C LCD"]
    ESP32 --> Backend["Express API"]
    Owner["Owner"] --> Backend
    Caretaker["Caretaker"] --> Backend
    Backend --> MongoDB["MongoDB Replica Set"]
    Backend --> Redis["Redis Config"]
    Backend --> Cloudinary["Cloudinary Images"]
```

The ESP32 gathers sensor data and can send readings to a database/API endpoint. The backend handles application records such as owners, caretakers, plants, co-owners, notifications, fertilizers, and readings.

## Repository Structure

```text
.
+-- Electronics/
|   +-- Electronics.kicad_pcb
|   +-- Electronics.kicad_sch
|   +-- Electronics.kicad_pro
|   +-- Green_sync.ino/
|   +-- Electronics-backups/
+-- Website/
|   +-- Backend/
|       +-- Backend/
|       |   +-- app.js
|       |   +-- index.js
|       |   +-- config/
|       |   +-- controllers/
|       |   +-- checks/
|       |   +-- middleware/
|       |   +-- models/
|       |   +-- routes/
|       |   +-- utils/
|       |   +-- docker-compose.yml
|       |   +-- package.json
|       +-- Electronics/
+-- Green Sync.drawio
+-- Capstone Project Proposal Template.docx
+-- Capstone Project Proposal Template.pdf
+-- Greensync report midterm.pdf
+-- final.docx
+-- final.pdf
+-- prt0001.prt.*
+-- README.md
```

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Docker Compose
- JWT
- Bcrypt
- Multer
- Cloudinary
- ioredis
- Cookie Parser
- CORS

### Hardware and Firmware

- ESP32
- Arduino/C++
- DHT temperature and humidity sensor
- Soil moisture sensor
- NPK sensor over serial/Modbus-style commands
- Relay module
- I2C LCD display
- KiCad PCB/schematic design

![ESP32 electronics prototype](https://source.unsplash.com/1200x500/?esp32,arduino,electronics,prototype)

## Backend Setup

Backend source code is located at:

```text
Website/Backend/Backend
```

### Prerequisites

- Node.js 18 or newer
- npm
- Docker Desktop
- MongoDB tools if you want to inspect the local database manually

### Install Dependencies

```bash
cd Website/Backend/Backend
npm install
```

### Start MongoDB

The backend includes a Docker Compose file that starts five MongoDB containers and initializes a replica set named `rs0`.

```bash
docker compose up -d
```

The current npm scripts also expect Docker containers named `mongo` and `green-sync` for development:

```bash
npm run dev
```

If those containers do not already exist, start the database with Docker Compose first or update the script to match your local container names.

### Start the Backend

```bash
npm start
```

The app entry point is `index.js`, which connects to MongoDB and starts the Express server on `PORT`.

## Environment Variables

Create a `.env` file inside:

```text
Website/Backend/Backend
```

Recommended variables:

```env
PORT=8000
CHUGH_CORS_ORIGIN=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/green-sync?replicaSet=rs0
MONGO_ROOT=./mongo-data

ACCESS_TOKEN_SECRET=replace_with_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace_with_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=replace_with_cloud_name
CLOUDINARY_API_KEY=replace_with_api_key
CLOUDINARY_API_SECRET=replace_with_api_secret

REDIS_HOST=localhost
REDIS_PORT=6379
```

Keep real secrets out of Git.

## API Overview

Base API path:

```text
/api/v1
```

### Owner Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `PUT` | `/owner/create` | No | Register an owner with optional `profile_pic`. |
| `POST` | `/owner/login` | No | Login an owner. |
| `POST` | `/owner/update` | Yes | Update owner details. |
| `DELETE` | `/owner/delete` | Yes | Delete owner account. |
| `POST` | `/owner/changePwd` | No | Change owner password. |
| `POST` | `/owner/changeProfilePicture` | Yes | Update owner profile image. |
| `POST` | `/owner/logout` | Yes | Logout owner. |
| `GET` | `/owner/getAccess` | No | Get access token flow. |
| `POST` | `/owner/addCaretaker` | Yes | Add a caretaker to a plant/account flow. |
| `GET` | `/owner/myPlants` | Yes | Fetch plants linked to the owner. |
| `GET` | `/owner/sharePlant` | Yes | Share a plant with a co-owner. |
| `DELETE` | `/owner/leavePlant` | Yes | Leave a shared plant. |
| `DELETE` | `/owner/removeCaretaker` | Yes | Remove caretaker access. |

### Plant Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/plant/create` | Yes | Create a plant with optional `plant_pic`. |
| `DELETE` | `/plant/delete` | Yes | Delete a plant. |
| `POST` | `/plant/readings` | No | Submit sensor readings. |

### Caretaker Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `PUT` | `/caretaker/create` | No | Register a caretaker with optional `profile_pic`. |

## Electronics and Firmware

The main firmware sketch is located at:

```text
Electronics/Green_sync.ino/Green_sync.ino.ino
```

The ESP32 firmware currently:

- Connects to WiFi.
- Reads humidity and temperature using a DHT sensor.
- Reads soil moisture through analog input pins.
- Reads nitrogen, phosphorus, and potassium values from an NPK sensor.
- Displays live readings on a 16x2 I2C LCD.
- Sends plant readings to a remote MongoDB Data API endpoint.
- Supports multiple plants through a linked-list structure.
- Controls relay pins for plant-side hardware.

Before uploading firmware, replace placeholders such as:

```cpp
YOUR_WIFI_SSID
YOUR_WIFI_PASSWORD
YOUR_APP_ID
YOUR_MONGODB_API_KEY
```

The KiCad files in `Electronics/` define the PCB and schematic for the hardware prototype.

## Project Documents

- `Capstone Project Proposal Template.docx`
- `Capstone Project Proposal Template.pdf`
- `Greensync report midterm.pdf`
- `final.docx`
- `final.pdf`
- `Green Sync.drawio`

These files document the project proposal, reports, and system design diagrams.

## Maintenance Notes

- Keep this README updated when routes, models, or setup commands change.
- Store credentials only in `.env` or secret managers.
- Keep generated KiCad backups and CAD revisions organized before submission.
- Prefer screenshots of the actual prototype over stock images when hardware photos are available.
- Add API examples once request/response bodies stabilize.

## Future Scope

- Build a frontend dashboard for owners and caretakers.
- Add live charts for temperature, humidity, soil moisture, and NPK trends.
- Add Swagger/OpenAPI documentation.
- Add automated backend tests for auth, plant, and readings flows.
- Move firmware secrets into a local ignored config file.
- Add deployment instructions for the backend, MongoDB, Redis, and media storage.

## Status

Green Sync is an active capstone prototype for the Thapar 2027 batch Group 9. The repository currently contains the core backend, electronics files, firmware, reports, and design artifacts needed to continue development.
