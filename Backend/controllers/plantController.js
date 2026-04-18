import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {plant} from "../models/plant.js"
import {owner} from "../models/owner.js"

const createPlant = asyncHandler(async (req, res) => {
    const { Owner, type, name, season, water, location, area, directCaretakerControl } = req.body;

    // 1. Validation
    if ([Owner, type, name, season, water, location, area, directCaretakerControl].some(field => !field)) {
        throw new apiError(400, "All fields are required");
    }

    // 2. Use findOne to get the actual object, not an array
    const ownerDoc = await owner.findOne({ _id: Owner });

    if (!ownerDoc) {
        throw new apiError(404, "Owner not found");
    }

    // 3. Generate the Custom ID
    // Using ownerDoc.totalFeilds (matches your typo in the schema)
    const customPlantId = `${Owner}${(ownerDoc.totalFeilds || 0) + 1}`;

    // 4. Create the Plant
    const newPlant = await plant.create({
        _id: customPlantId,
        owner: ownerDoc._id,
        type,
        name,
        season,
        water,
        location,
        area,
        directCaretakerControl
    });

    // update total feild for owner
    await owner.findByIdAndUpdate(ownerDoc._id, {
        $inc: { totalFeilds: 1 }
    });

    return res.status(201).json(
        new apiResponse(201, newPlant, "Plant created successfully")
    );
});

export default createPlant;
export {
    createPlant,  //auth(owner) ,input , validate , add to plant table , add to co owner table
    // deletePlant,  // auth(owner), verify pwd , my plants , del (plant , customer , co owner , fertiliser , reading) ,notify (cr , co owner) 
    // updatePlant,  //auth(owner) , my plants , not (water, esp mac , image) ,update plant table ,success 
    // activateWater,//auth , my plants or (customer and direct cc) , try on esp (do not send success as esp might take hours to water)
    // water_eq    // cors , success
}