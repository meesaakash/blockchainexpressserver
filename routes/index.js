const express = require("express");
const bodyParser = require("body-parser");
const Web3 = require("web3");
const ABI = require("../artifacts/DvP.json");

const jsonParser = bodyParser.json();
const router = express.Router();

const contractAddress = "0xD1D10c284f4451E65F32eC7E81980aF687fc1569";

const tx = {
  gas: 1000000,
  to: contractAddress,
};
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://sepolia.infura.io/v3/e70b3acb840342729f666e51f4d447b5")
);

const contract = new web3.eth.Contract(ABI.abi, contractAddress);

//create a new swap request (done by seller)
router.post("/newSwap", jsonParser, async (req,res) => {
    const { _token2Sell, _amount2Sell, _amount2Buy, bondHolder, privateKey} =
      req.body;

    try {
      const data = contract.methods
        .newSwap(_token2Sell, _amount2Sell, _amount2Buy)
        .encodeABI();
  
      await web3.eth.accounts
        .signTransaction({ ...tx, data}, privateKey)
        .then((signed) => {
          web3.eth
            .sendSignedTransaction(signed.rawTransaction)
            .then((response) => {
              console.log(response);
              res.status(201);
              res.json({
                message: `Swap of ${_token2Sell} sold for seller: ${_amount2Sell} to be bought for buyer: ${_amount2Buy} successfully requested`,
                transactionHash: response.transactionHash,
                blockNumber: response.blockNumber,
                swapid: response.data,
                // resp: response
              })
            })
            .catch((err) => {
              res.status(400);
              res.json({ message: err.message });
            });
        })
    } catch (error) {
      res.status(400);
      res.json({ message: error.message });
    }
  });

  //cancel swap request (done by seller)
  router.post("/cancelSwap", jsonParser, async (req,res) => {
    const {_swapId, bondHolder, privateKey} =
      req.body;

    console.log(_swapId)
    console.log(bondHolder);
    console.log(privateKey);

    try {
      const data = contract.methods
        .cancelSwap(_swapId)
        .encodeABI();
      
      await web3.eth.accounts
        .signTransaction({ ...tx, data}, privateKey)
        .then((signed) => {
          web3.eth
            .sendSignedTransaction(signed.rawTransaction)
            .then((response) => {
              res.status(201);
              res.json({
                message: `Swap request for id ${_swapId} has been cancelled`,
                transactionHash: response.transactionHash,
                blockNumber: response.blockNumber,
              })
            })
            .catch((err) => {
              res.status(400);
              res.json({ message: err.message });
            });
        })
    } catch (error) {
      res.status(400);
      res.json({ message: error.message });
    }
  })

  //finalize swap request (done by buyer)
  router.post("/finalizeSwap", jsonParser, async (req,res) => {
    const {_swapId, cashTokenHolder, privateKey} =
      req.body;

    console.log(_swapId)
    console.log(cashTokenHolder);
    console.log(privateKey);
    try {
      const data = contract.methods
        .finalizeSwap(_swapId)
        .encodeABI();
      
      await web3.eth.accounts
        .signTransaction({ ...tx, data}, privateKey)
        .then((signed) => {
          web3.eth
            .sendSignedTransaction(signed.rawTransaction)
            .then((response) => {
              res.status(201);
              res.json({
                
                message: `Swap request for id ${_swapId} has been successfully finalized`,
                transactionHash: response.transactionHash,
                blockNumber: response.blockNumber,
                
              })
            })
            .catch((err) => {
              res.status(400);
              res.json({ message: err.message });
            });
        })
    } catch (error) {
      res.status(400);
      res.json({ message: error.message });
    }
  })

 //get swap count (returns swap id of posted swap requests)
 
  router.get("/getSwapCount", async (req, res) => {
    const swapId = await contract.methods.getSwapCount().call();
    res.json({ swapId });
  });

  //get swap based on swap id returned from getSwapCount
  //status of swap isn't finalized if first address is 0x0000000000, can still be cancelled
  //swap approved if two user addresses are listed in arguments (no 0x0000..), cannot be cancelled

  router.get("/getSwap", async (req, res) => {
    const {_swapId} = req.query;
    try {
    if (_swapId == null) throw new Error("swapId not provided");
      const myswap = await contract.methods.getSwap(_swapId).call();
      //show 2 fields instead of one status, show statusCode as 1 or 2 or 3, and statusDescription as finalized
      var statusCode =2;
      var statusDescription = "Finalized"
      if (myswap[0] == "0x0000000000000000000000000000000000000000") {
        console.log("statusCode is 1, statusDescription is Pending");
        statusCode =1;
        statusDescription="Pending"
      } else if (myswap[1] === myswap[0]) {
        console.log("statusCode is 3, statusDescription is Cancelled");
        statusCode=3;
        statusDescription="Cancelled";
      } else {
        console.log("statusCode is 2, statusDescription is Finalized");
      }

      res.json({ statusCode: statusCode, statusDescription: statusDescription });
    } catch (error) {
      res.status(400);
      res.json({message: error.message}); 

    }
  });

//add whitelist contract methods here

module.exports = router;
