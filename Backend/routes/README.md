# Routes

Routes define the public API paths for the Green Sync backend. Each route file maps HTTP methods and endpoint paths to middleware and controller functions.

## Current Files

- `ownerRoute.js` defines owner account, auth, sharing, and caretaker-management endpoints.
- `plantRoute.js` defines plant creation, deletion, and sensor reading endpoints.
- `caretakerRoute.js` defines caretaker creation endpoints.
- `sensorRoute.js` is present for sensor-related routing and may be used as the readings API grows.

## Mounted Paths

Routes are mounted in `../app.js`:

```text
/api/v1/owner
/api/v1/plant
/api/v1/caretaker
```