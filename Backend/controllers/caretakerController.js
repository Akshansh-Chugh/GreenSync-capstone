export {createCaretaker, // same are owner
    deleteCaretaker, //auth , verify pwd, notify customer, del caretaker table , del customer table, plant.direct caretaker control=0
    updateCaretaker, // same as owner
    login, // same
    logout, // same
    changePwd, //same
    changeProfile, //same
    leavePlant, // auth, plant in customer and accept=1 , notify , del customer
    acceptReq, // auth , plant in customer & accept, notify
    recommend, // auth , in customer table , accpted , add a notification entry
    activateWater // auth , in customer table , plant.direct cc control=1
}