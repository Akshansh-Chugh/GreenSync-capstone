import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { reading } from "../models/readings.js";
import { plant } from "../models/plant.js";

const plantToDB = asyncHandler(async (req, res) => {
    let { plant1, soilMoisture, humidity, temp, n, p, k } = {
        ...req.params,
        ...req.query,
        ...req.body
    };
    if (!plant1 || !soilMoisture || !humidity || !temp) throw new apiError(400, "All fields are required");

    let verify = await plant.findById(plant1);
    if (!verify) throw new apiError(400, "Plant not found");
    let newReading;
    if (soilMoisture > 4095 || humidity > 100 || temp > 100) throw new apiError(400, "Invalid values");
    if (n && p && k) {
        newReading = await reading.create({
            temp,
            humidity,
            soilMoisture,
            n,
            p,
            k,
            plant: plant1
        });
    } else {
        newReading = await reading.create({
            temp: temp,
            humidity: humidity,
            soilMoisture: soilMoisture,
            plant: plant1
        });
    }
    if (!newReading) throw new apiError(500, "Reading creation failed");

    res.json(new apiResponse(200, newReading));
});

const sendPlantReadings = asyncHandler(async (req, res) => {
    const plantId =
        req.body?.plantId ||
        req.body?.plant ||
        req.body?.Plant ||
        req.body?.plant_id ||
        req.body?.plant1 ||
        req.body?.id ||
        req.query?.plantId ||
        req.query?.plant ||
        req.query?.Plant ||
        req.query?.plant_id ||
        req.query?.plant1 ||
        req.query?.id;

    if (!plantId) {
        throw new apiError(400, "Plant ID is required");
    }

    const verify = await plant.findById(plantId);
    if (!verify) {
        throw new apiError(404, "Plant not found");
    }

    let filter = { plant: plantId };

    if (req.body?.days || req.query?.days) {
        const days = Number(req.body?.days || req.query?.days);
        if (!isNaN(days) && days > 0) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);
            filter.createdAt = { $gte: dateLimit };
        }
    }

    let query = reading.find(filter).sort({ createdAt: -1 });

    if (req.body?.limit || req.query?.limit) {
        const limit = Number(req.body?.limit || req.query?.limit);
        if (!isNaN(limit) && limit > 0) {
            query = query.limit(limit);
        }
    }

    const readings = await query;

    return res
        .status(200)
        .json(new apiResponse(200, readings, "Plant sensor readings retrieved successfully"));
});

export {
    plantToDB,
    sendPlantReadings,
    sendPlantReadings as getPlantReadings,
    sendPlantReadings as sendReadings
};

export default sendPlantReadings;