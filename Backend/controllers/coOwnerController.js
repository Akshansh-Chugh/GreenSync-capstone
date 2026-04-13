export {
    createCoRecord, //(add co owner to exsisting plant) auth , my plants,Enter email/phno of new owner, add entry to co owner table  
    deleteCoRecord, // auth , my plant , co owner's plant, not himself, remove co owner entry , notify
    leavePlant, // auth , my plant , not only owner (else del or transfer plant )error, remove
    my_plants, //auth , pipeline , add to req.body , try {next()} catch (err) {res.json(new api res)}
    plant_owners // same
}