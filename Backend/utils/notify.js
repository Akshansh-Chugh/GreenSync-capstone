import { notification} from "../models/notification.js";
import { plant } from "../models/plant.js";
import {caretaker} from "../models/caretaker.js";


const notifyPlant = async (from, to, message) => {
    try {
        const TO=await plant.findById(to)
        const FROM = await caretaker.findById(from)
        if (!TO || !FROM) 
            return false
        
        const myPlants= await FROM.myPlants()
        const isCaringForPlant= myPlants.some(
            doc=> doc.plant._id.toString() === to.toString() 
        );

        if(!isCaringForPlant) return false;

        const N = await notification.create({to:TO._id,from: FROM._id,message})
        return !!N
    } catch (error) {
        return false
    }
}

export default notifyPlant