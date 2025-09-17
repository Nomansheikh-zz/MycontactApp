const aysncHandler = require("express-async-handler");

const Contract = require("../model/contractModel");
// @desc Get all contracts
// @route GET /api/contracts
// @access Public
const getContracts = aysncHandler(async (req, res) => {
   const contracts = await Contract.find();
    res.status(200).json({contracts});
});
//@desc Create a contract
// @route POST /api/contracts
// @access Public
const createContract = aysncHandler(async (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Body raw:", req.body);

    if (!req.body) {
        return res.status(400).json({ message: "No request body received" });
    }

    const {name, email, phone} = req.body;
   try {
       if(!name || !email || !phone) {
           return res.status(400).json({message: "All fields are required"});
       }
        const contract = await Contract.create({name, email, phone});
        res.status(201).json({contract});
   } catch (error) {
        res.status(400).json({message: error.message});
   }
    /*console.log(req.body);
    if(!name || !email || !phone) {
        return res.status(400).json({message: "All fields are required"});
    }
    const contract = await Contract.create({name, email, phone});
    res.status(201).json({contract});*/
    //res.status(200).json({message: `create contract`});
});
//@desc Update a contract
// @route PUT /api/contracts/:id
// @access Public
const updateContract = aysncHandler(async (req, res) => {
    res.status(200).json({message: `update contract ${req.params.id}`});
});
// @desc Delete a contract
// @route DELETE /api/contracts/:id
// @access Public
const deleteContract = aysncHandler(async (req, res) => {
    res.status(200).json({message: `delete contract ${req.params.id}`});
})  ;
module.exports = {
    getContracts,
    createContract,
    updateContract,
    deleteContract
};