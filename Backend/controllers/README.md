# Controllers

Controllers contain the main request-handling logic for the Green Sync API. They receive validated route requests, call models and utilities, and return structured API responses.

## Current Files

- `ownerController.js` handles owner registration, login, profile updates, plant sharing, caretaker access, and account actions.
- `caretakerController.js` handles caretaker creation,login, profile updates,account actions, accepting/rejecting new plant requests.
- `plantController.js` handles plant creation and deletion.
- `sensorController.js` handles incoming sensor readings.
- `readingController.js` is intended for reading-related operations.
- `fertilizerController.js` is intended for fertilizer-related operations.
- `coOwnerController.js` is intended for co-owner-related operations.

## Backend Flow

```text
route -> middleware/checks -> controller -> model/utils -> response
```