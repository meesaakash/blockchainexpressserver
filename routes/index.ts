import bodyParser from "body-parser";
import express from "express";
import moment from "moment";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import ABI from "../artifacts/DigitalBond.json";

const jsonParser = bodyParser.json();
const router = express.Router();

// const contractAddress = "0xd34B431E62d37ab4D6F134f94824825279a626e5";
const contractAddress = "0x079a7a55da2E87454bC48E6ad9efF6392Bb9b465";
const tx = {
  gas: 1000000,
  to: contractAddress,
};
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    // "http://34.159.29.172:8545/"
    "https://sepolia.infura.io/v3/e70b3acb840342729f666e51f4d447b5"
  )
);

const contract = new web3.eth.Contract(ABI.abi as AbiItem[], contractAddress);

const checkRegistrar = async (address: any) => {
  const registrar = await contract.methods.registrar().call();
  return registrar === address;
};

const checkAllowed = async (address: any) => {
  const issuer = await contract.methods.issuer().call();
  return (
    (await contract.methods.allowedAddress(address).call()) ||
    issuer === address
  );
};

router.get("/balance", jsonParser, async (req, res) => {
  const { address } = req.query;
  var balance;
  try {
    if (address == null) throw new Error("Address not provided");
    balance = await contract.methods.balanceOf(address).call();
    res.json({ address, balance });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.get("/allowedAddress", async (req, res) => {
  const { address } = req.query;
  var allowed;
  try {
    if (address == null) throw new Error("Address not provided");
    allowed = await contract.methods.allowedAddress(address).call();
    res.json({ address, allowed });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.get("/totalSupply", async (req, res) => {
  const totalSupply = await contract.methods.totalSupply().call();
  res.json({ totalSupply });
});

router.get("/issuer", async (req, res) => {
  const issuer = await contract.methods.issuer().call();
  res.json({ issuer });
});

router.get("/registrar", async (req, res) => {
  const registrar = await contract.methods.registrar().call();
  res.json({ registrar });
});

router.get("/maxSupply", async (req, res) => {
  const maxSupply = await contract.methods.maxSupply().call();
  res.json({ maxSupply });
});

router.get("/paperContractHash", async (req, res) => {
  const paperContractHash = await contract.methods.paperContractHash().call();
  res.json({ paperContractHash });
});

router.get("/paperContractUrl", async (req, res) => {
  const paperContractUrl = await contract.methods.paperContractUrl().call();
  res.json({ paperContractUrl });
});

router.get("/paused", async (req, res) => {
  const paused = await contract.methods.paused().call();
  res.json({ paused });
});

router.get("/isin", async (req, res) => {
  const isin = await contract.methods.isin().call();
  res.json({ isin });
});

router.get("/contract", async (req, res) => {
  res.json({ contractAddress });
});

router.get("/issuance", async (req, res) => {
  const issuanceYear = await contract.methods.issuanceYear().call();
  const issuanceMonth = await contract.methods.issuanceMonth().call();
  const issuanceDate = await contract.methods.issuanceDate().call();
  const date = moment(
    `${issuanceDate}/${issuanceMonth}/${issuanceYear}`,
    "DD/MM/YYYY"
  );
  res.json({ date: date.format("Do MMM YYYY") });
});

router.get("/maturity", async (req, res) => {
  const maturityYear = await contract.methods.maturityYear().call();
  const maturityMonth = await contract.methods.maturityMonth().call();
  const maturityDate = await contract.methods.maturityDate().call();
  const date = moment(
    `${maturityDate}/${maturityMonth}/${maturityYear}`,
    "DD/MM/YYYY"
  );
  res.json({ date: date.format("Do MMM YYYY") });
});

// Write Function Endpoints

router.post("/issueToIssuer", jsonParser, async (req, res) => {
  const { amount, registrarAddress, privateKey } = req.body;

  const registrarCheck = await checkRegistrar(registrarAddress);
  const issuer = await contract.methods.issuer().call();
  try {
    if (!registrarCheck) throw new Error("Registrar address invalid");
    const maxSupply = await contract.methods.maxSupply().call();
    const totalSupply = await contract.methods.totalSupply().call();
    if (amount + totalSupply > maxSupply) {
      throw new Error("Insufficient supply left to issue");
    }
    const data = contract.methods.mint(issuer, amount).encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: amount + " tokens minted successfully to the issuer.",
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err: any) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/registrarTransfer", jsonParser, async (req, res) => {
  const { fromAddress, toAddress, amount, registrarAddress, privateKey } =
    req.body;
  var hash: string;
  const registrarCheck = await checkRegistrar(registrarAddress);
  const fromCheck = await checkAllowed(fromAddress);
  const toCheck = await checkAllowed(toAddress);
  try {
    if (!registrarCheck) throw new Error("Registrar address invalid");
    if (!fromCheck) throw new Error("From address not allow listed");
    if (!toCheck)
      throw new Error("To address " + toAddress + " not allow listed");
    const sbal = await contract.methods.balanceOf(fromAddress).call();
    if (typeof sbal === "number" && sbal < amount)
      throw new Error(" Transferrer does not have enough tokens");
    const data = contract.methods
      .registrarTransfer(fromAddress, toAddress, amount)
      .encodeABI();

    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: `Transfer of ${amount} units from ${fromAddress} to ${toAddress} successful`,
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch(async (err: any) => {
            res.status(400);

            const reverterErrorMsg =
              "Transaction has been reverted by the EVM:";
            if (err.message.startsWith(reverterErrorMsg)) {
              const receiptString = err.message.slice(reverterErrorMsg.length);
              const receiptJSON = JSON.parse(receiptString);
              console.log("receiptjson=" + receiptJSON);
              hash = receiptJSON.transactionHash;
              if (receiptJSON.status === true) {
                console.log(" status=" + receiptJSON);
              }
            }
            console.log(" hash=" + hash);
            const txt = web3.eth.getTransaction(hash);
            var result = await web3.eth.call(tx);
            result = result.toString().startsWith("0x")
              ? result
              : `0x${result}`;
            var reason;
            if (result && result.substr(138)) {
              reason = web3.utils.toAscii(result.substr(138));
              console.log("Revert reason:", reason);
            } else {
              console.log("Cannot get reason - No return value");
            }

            res.json({ message: err.message + " ***********  " + hash });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/setRegistrar", jsonParser, async (req, res) => {
  const { registrarAddress, address, privateKey } = req.body;

  const registrarCheck = await checkRegistrar(registrarAddress);
  try {
    if (registrarAddress == null)
      throw new Error("Registrar Address not provided");
    if (address == null) throw new Error("New Address not provided");
    if (privateKey == null) throw new Error("Private key not provided");
    if (!registrarCheck)
      throw new Error("Registrar address " + registrarAddress + "  invalid");
    const data = contract.methods.setRegistrar(address).encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: `Registrar set to ${address} successfully.`,
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/redeem", jsonParser, async (req, res) => {
  const { registrarAddress, privateKey } = req.body;
  var balance;
  const registrarCheck = await checkRegistrar(registrarAddress);
  try {
    if (privateKey == null) throw new Error("privatekey not provided");
    if (registrarAddress == null)
      throw new Error("registrarAddress not provided");
    if (!registrarCheck)
      throw new Error("Registrar address " + registrarAddress + " invalid");
    const data = contract.methods.redeem().encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            console.log("in Redeem");
            res.status(201);
            res.json({
              message: "Units redeemed successfully.",
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/setIssuer", jsonParser, async (req, res) => {
  const { issuerAddress, registrarAddress, privateKey } = req.body;

  try {
    if (registrarAddress == null)
      throw new Error("Registrar Address not provided");
    if (issuerAddress == null)
      throw new Error("New Issuer Address not provided");
    if (privateKey == null) throw new Error("Private key not provided");
    const registrarCheck = await checkRegistrar(registrarAddress);

    if (!registrarCheck) throw new Error("Registrar address invalid");
    const data = contract.methods.setIssuer(issuerAddress).encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: `Issuer set to ${issuerAddress} successfully.`,
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/allowAddress", jsonParser, async (req, res) => {
  const { address, allow, registrarAddress, privateKey } = req.body;

  const registrarCheck = await checkRegistrar(registrarAddress);
  try {
    if (!registrarCheck)
      throw new Error("Registrar address " + registrarAddress + " invalid");
    const data = contract.methods.allowAddress(address, allow).encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: `Address ${address} is ${
                allow ? "now allowed" : "no longer allowed"
              }`,
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/pauseTransfers", jsonParser, async (req, res) => {
  const { pause, registrarAddress, privateKey } = req.body;

  const registrarCheck = await checkRegistrar(registrarAddress);
  try {
    if (!registrarCheck) throw new Error("Registrar address invalid");
    const data = contract.methods.pauseTransfers(pause).encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: `Transfers are ${pause ? "now" : "no longer"} paused`,
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/registrarBurnFrom", jsonParser, async (req, res) => {
  const { address, amount, registrarAddress, privateKey } = req.body;

  const registrarCheck = await checkRegistrar(registrarAddress);
  try {
    if (!registrarCheck) throw new Error("Registrar address invalid");
    const userBal = await contract.methods.balanceOf(address).call();
    if (amount == 0 || amount > userBal) {
      throw new Error("Insufficient tokens to burn");
    }
    const data = contract.methods
      .registrarBurnFrom(address, amount)
      .encodeABI();
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: "Registrar burn success.",
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

router.post("/registrarBurnAllFrom", jsonParser, async (req, res) => {
  const { address, registrarAddress, privateKey } = req.body;

  const registrarCheck = await checkRegistrar(registrarAddress);
  try {
    if (!registrarCheck) throw new Error("Registrar address invalid");
    const data = contract.methods.registrarBurnAllFrom(address).encodeABI();
    const userBal = await contract.methods.balanceOf(address).call();
    if (userBal === 0) {
      throw new Error("No units to burn");
    }
    await web3.eth.accounts
      .signTransaction({ ...tx, data }, privateKey)
      .then((signed) => {
        web3.eth
          .sendSignedTransaction(signed.rawTransaction!)
          .then((response) => {
            res.status(201);
            res.json({
              message: "Registrar burn all success.",
              transactionHash: response.transactionHash,
              blockNumber: response.blockNumber,
            });
          })
          .catch((err) => {
            res.status(400);
            res.json({ message: err.message });
          });
      });
  } catch (error: any) {
    res.status(400);
    res.json({ message: error.message });
  }
});

export default router;
