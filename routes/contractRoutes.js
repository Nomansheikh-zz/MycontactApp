const express = require("express");
const router = express.Router();
const {getContracts, createContract , updateContract, deleteContract, getContract} = require("../controllers/contractController");
router.route("/").get(getContracts);
router.route("/").post(createContract);
router.route("/:id").put(updateContract);
router.route("/:id").delete(deleteContract);
module.exports = router;