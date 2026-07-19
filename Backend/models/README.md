# Models

This folder contains the Mongoose schemas used by the Green Sync backend.

## Field Naming Rule

In the tables below:

- `UPPERCASE` field names are required in the schema.
- `lowercase` field names are optional or have defaults.

## Owner Model

File: `owner.js`

| Field | Type | Notes |
| --- | --- | --- |
| `NAME` | String | Owner full name. |
| `EMAIL` | String | Unique owner email. |
| `PHONE` | String | Unique owner phone number. |
| `PASSWORD` | String | Hashed before saving. |
| `age` | Number | Optional owner age. |
| `adhaar` | String | Sparse unique identity field. |
| `totalfeilds` | Number | Optional field count value. |
| `profile_pic` | String | Defaults to a Cloudinary image URL. |
| `refreshtoken` | String | Stored refresh token. |

## Plant Model

File: `plant.js`

| Field | Type | Notes |
| --- | --- | --- |
| `TYPE` | String | Plant type/category. |
| `AREA` | Number | Plant area value. |
| `ESPMAC` | String | ESP32 MAC address linked to the plant. |
| `name` | String | Optional plant name. |
| `season` | String | Optional enum: `summer`, `winter`, `spring`, `fall`. |
| `water` | Number | Optional water value. |
| `location` | String | Optional plant location. |
| `directcaretakercontrol` | Boolean | Defaults to `false`. |
| `plant_pic` | String | Defaults to a Cloudinary image URL. |

## Reading Model

File: `readings.js`

| Field | Type | Notes |
| --- | --- | --- |
| `TEMP` | Number | Temperature reading. |
| `HUMIDITY` | Number | Humidity reading. |
| `SOILMOISTURE` | Number | Soil moisture reading. |
| `N` | Number | Nitrogen value. |
| `P` | Number | Phosphorus value. |
| `K` | Number | Potassium value. |
| `PLANT` | ObjectId | References the related plant and is indexed. |

## Caretaker Model

File: `caretaker.js`

| Field | Type | Notes |
| --- | --- | --- |
| `NAME` | String | Caretaker full name. |
| `EMAIL` | String | Caretaker email. |
| `PHONE` | String | Caretaker phone number. |
| `PASSWORD` | String | Hashed before saving. |
| `QUALIFICATION` | String | Caretaker qualification. |
| `ADHAAR` | String | Caretaker identity field. |
| `age` | Number | Optional caretaker age. |
| `refreshtoken` | String | Stored refresh token. |
| `profilepic` | String | Defaults to a Cloudinary image URL. |

## CoOwner Model

File: `coOwner.js`

| Field | Type | Notes |
| --- | --- | --- |
| `OWNER` | ObjectId | References `Owner` and is indexed. |
| `PLANT` | ObjectId | References `Plant` and is indexed. |

Unique compound index:

```text
owner + plant
```

## Customer Model

File: `customer.js`

| Field | Type | Notes |
| --- | --- | --- |
| `CARETAKER` | ObjectId | References caretaker data. |
| `PLANT` | ObjectId | References plant data and is indexed. |
| `accepted` | Boolean | Defaults to `false`. |

Unique compound index:

```text
plant + caretaker
```

## Fertilizer Model

File: `fertilizer.js`

| Field | Type | Notes |
| --- | --- | --- |
| `NAME` | String | Fertilizer name. |
| `CONCENTRATION` | Number | Fertilizer concentration value. |
| `PLANT` | ObjectId | References the related plant and is indexed. |

## Notification Model

File: `notification.js`

| Field | Type | Notes |
| --- | --- | --- |
| `TO` | ObjectId | References target plant and is indexed. |
| `FROM` | ObjectId | References caretaker sender. |
| `MESSAGE` | String | Notification message body. |
| `seen` | String | Defaults to `false`. |