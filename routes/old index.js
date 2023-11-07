"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = require("body-parser");
var express_1 = require("express");
var web3_1 = require("web3");
var DigitalBond_json_1 = require("../artifacts/DigitalBond.json");
var jsonParser = body_parser_1.default.json();
var router = express_1.default.Router();
var contractAddress = "0x27efCCfeeab841b0a182aEEBF5ee5AA69AAEA4a6";
var tx = {
    gas: 1000000,
    to: contractAddress,
};
var web3 = new web3_1.default(new web3_1.default.providers.HttpProvider("https://sepolia.infura.io/v3/e70b3acb840342729f666e51f4d447b5"));
var contract = new web3.eth.Contract(DigitalBond_json_1.default.abi, contractAddress);
var checkRegistrar = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var registrar;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.registrar().call()];
            case 1:
                registrar = _a.sent();
                return [2 /*return*/, registrar === address];
        }
    });
}); };
var checkAllowed = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var issuer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.issuer().call()];
            case 1:
                issuer = _a.sent();
                return [4 /*yield*/, contract.methods.allowedAddress(address).call()];
            case 2: return [2 /*return*/, ((_a.sent()) ||
                    issuer === address)];
        }
    });
}); };
router.get("/balance", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var address, balance, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                address = req.query.address;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                if (address == null)
                    throw new Error("Address not provided");
                return [4 /*yield*/, contract.methods.balanceOf(address).call()];
            case 2:
                balance = _a.sent();
                res.json({ address: address, balance: balance });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                res.status(400);
                res.json({ message: error_1.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/allowedAddress", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var address, allowed, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                address = req.query.address;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                if (address == null)
                    throw new Error("Address not provided");
                return [4 /*yield*/, contract.methods.allowedAddress(address).call()];
            case 2:
                allowed = _a.sent();
                res.json({ address: address, allowed: allowed });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                res.status(400);
                res.json({ message: error_2.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/currentSupply", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var currentSupply;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.currentSupply().call()];
            case 1:
                currentSupply = _a.sent();
                res.json({ currentSupply: currentSupply });
                return [2 /*return*/];
        }
    });
}); });
router.get("/issuer", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var issuer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.issuer().call()];
            case 1:
                issuer = _a.sent();
                res.json({ issuer: issuer });
                return [2 /*return*/];
        }
    });
}); });
router.get("/registrar", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var registrar;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.registrar().call()];
            case 1:
                registrar = _a.sent();
                res.json({ registrar: registrar });
                return [2 /*return*/];
        }
    });
}); });
router.get("/totalSupply", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var totalSupply;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.totalSupply().call()];
            case 1:
                totalSupply = _a.sent();
                res.json({ totalSupply: totalSupply });
                return [2 /*return*/];
        }
    });
}); });
router.get("/paperContractHash", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var paperContractHash;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.paperContractHash().call()];
            case 1:
                paperContractHash = _a.sent();
                res.json({ paperContractHash: paperContractHash });
                return [2 /*return*/];
        }
    });
}); });
router.get("/paperContractUrl", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var paperContractUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.paperContractUrl().call()];
            case 1:
                paperContractUrl = _a.sent();
                res.json({ paperContractUrl: paperContractUrl });
                return [2 /*return*/];
        }
    });
}); });
router.get("/paused", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var paused;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.paused().call()];
            case 1:
                paused = _a.sent();
                res.json({ paused: paused });
                return [2 /*return*/];
        }
    });
}); });
router.get("/isin", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var isin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.methods.isin().call()];
            case 1:
                isin = _a.sent();
                res.json({ isin: isin });
                return [2 /*return*/];
        }
    });
}); });
router.get("/contract", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.json({ contractAddress: contractAddress });
        return [2 /*return*/];
    });
}); });
// Write Function Endpoints
router.post("/issueToIssuer", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, amount, registrarAddress, privateKey, registrarCheck, issuer, data, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, amount = _a.amount, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                return [4 /*yield*/, contract.methods.issuer().call()];
            case 2:
                issuer = _b.sent();
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                if (!registrarCheck)
                    throw new Error("Registrar address invalid");
                data = contract.methods.mint(issuer, amount).encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: amount + " tokens minted successfully to the issuer.",
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 4:
                _b.sent();
                return [3 /*break*/, 6];
            case 5:
                error_3 = _b.sent();
                res.status(400);
                res.json({ message: error_3.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post("/registrarTransfer", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fromAddress, toAddress, amount, registrarAddress, privateKey, hash, registrarCheck, fromCheck, toCheck, sbal, data, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, fromAddress = _a.fromAddress, toAddress = _a.toAddress, amount = _a.amount, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                return [4 /*yield*/, checkAllowed(fromAddress)];
            case 2:
                fromCheck = _b.sent();
                return [4 /*yield*/, checkAllowed(toAddress)];
            case 3:
                toCheck = _b.sent();
                _b.label = 4;
            case 4:
                _b.trys.push([4, 7, , 8]);
                if (!registrarCheck)
                    throw new Error("Registrar address invalid");
                if (!fromCheck)
                    throw new Error("From address not allow listed");
                if (!toCheck)
                    throw new Error("To address " + toAddress + " not allow listed");
                return [4 /*yield*/, contract.methods.balanceOf(fromAddress).call()];
            case 5:
                sbal = _b.sent();
                if (typeof sbal === "number" && sbal < amount)
                    throw new Error(" Transferrer does not have enough tokens");
                data = contract.methods
                    .registrarTransfer(fromAddress, toAddress, amount)
                    .encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Transfer of ".concat(amount, " units from ").concat(fromAddress, " to ").concat(toAddress, " successful"),
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                            var reverterErrorMsg, receiptString, receiptJSON, txt, result, reason;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        res.status(400);
                                        reverterErrorMsg = "Transaction has been reverted by the EVM:";
                                        if (err.message.startsWith(reverterErrorMsg)) {
                                            receiptString = err.message.slice(reverterErrorMsg.length);
                                            receiptJSON = JSON.parse(receiptString);
                                            console.log("receiptjson=" + receiptJSON);
                                            hash = receiptJSON.transactionHash;
                                            if (receiptJSON.status === true) {
                                                console.log(" status=" + receiptJSON);
                                            }
                                        }
                                        console.log(" hash=" + hash);
                                        txt = web3.eth.getTransaction(hash);
                                        return [4 /*yield*/, web3.eth.call(tx)];
                                    case 1:
                                        result = _a.sent();
                                        result = result.toString().startsWith("0x")
                                            ? result
                                            : "0x".concat(result);
                                        if (result && result.substr(138)) {
                                            reason = web3.utils.toAscii(result.substr(138));
                                            console.log("Revert reason:", reason);
                                        }
                                        else {
                                            console.log("Cannot get reason - No return value");
                                        }
                                        res.json({ message: err.message + " ***********  " + hash });
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            case 6:
                _b.sent();
                return [3 /*break*/, 8];
            case 7:
                error_4 = _b.sent();
                res.status(400);
                res.json({ message: error_4.message });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.post("/setRegistrar", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, registrarAddress, address, privateKey, registrarCheck, data, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, registrarAddress = _a.registrarAddress, address = _a.address, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                if (registrarAddress == null)
                    throw new Error("Registrar Address not provided");
                if (address == null)
                    throw new Error("New Address not provided");
                if (privateKey == null)
                    throw new Error("Private key not provided");
                if (!registrarCheck)
                    throw new Error("Registrar address " + registrarAddress + "  invalid");
                data = contract.methods.setRegistrar(address).encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Registrar set to ".concat(address, " successfully."),
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_5 = _b.sent();
                res.status(400);
                res.json({ message: error_5.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/redeem", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, registrarAddress, privateKey, balance, registrarCheck, data, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                if (privateKey == null)
                    throw new Error("privatekey not provided");
                if (registrarAddress == null)
                    throw new Error("registrarAddress not provided");
                if (!registrarCheck)
                    throw new Error("Registrar address " + registrarAddress + " invalid");
                data = contract.methods.redeem().encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            console.log("in Redeem");
                            res.status(201);
                            res.json({
                                message: "Units redeemed successfully.",
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_6 = _b.sent();
                res.status(400);
                res.json({ message: error_6.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/setIssuer", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, issuerAddress, registrarAddress, privateKey, registrarCheck, data, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, issuerAddress = _a.issuerAddress, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                if (registrarAddress == null)
                    throw new Error("Registrar Address not provided");
                if (issuerAddress == null)
                    throw new Error("New Issuer Address not provided");
                if (privateKey == null)
                    throw new Error("Private key not provided");
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 2:
                registrarCheck = _b.sent();
                if (!registrarCheck)
                    throw new Error("Registrar address invalid");
                data = contract.methods.setIssuer(issuerAddress).encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Issuer set to ".concat(issuerAddress, " successfully."),
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_7 = _b.sent();
                res.status(400);
                res.json({ message: error_7.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/allowAddress", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, address, allow, registrarAddress, privateKey, registrarCheck, data, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, address = _a.address, allow = _a.allow, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                if (!registrarCheck)
                    throw new Error("Registrar address " + registrarAddress + " invalid");
                data = contract.methods.allowAddress(address, allow).encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Address ".concat(address, " is ").concat(allow ? "now allowed" : "no longer allowed"),
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_8 = _b.sent();
                res.status(400);
                res.json({ message: error_8.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/pauseTransfers", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, pause, registrarAddress, privateKey, registrarCheck, data, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, pause = _a.pause, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                if (!registrarCheck)
                    throw new Error("Registrar address invalid");
                data = contract.methods.pauseTransfers(pause).encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Transfers are ".concat(pause ? "now" : "no longer", " paused"),
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_9 = _b.sent();
                res.status(400);
                res.json({ message: error_9.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/registrarBurnFrom", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, address, amount, registrarAddress, privateKey, registrarCheck, data, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, address = _a.address, amount = _a.amount, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                if (!registrarCheck)
                    throw new Error("Registrar address invalid");
                data = contract.methods
                    .registrarBurnFrom(address, amount)
                    .encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Registrar burn success.",
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_10 = _b.sent();
                res.status(400);
                res.json({ message: error_10.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post("/registrarBurnAllFrom", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, address, registrarAddress, privateKey, registrarCheck, data, error_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, address = _a.address, registrarAddress = _a.registrarAddress, privateKey = _a.privateKey;
                return [4 /*yield*/, checkRegistrar(registrarAddress)];
            case 1:
                registrarCheck = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                if (!registrarCheck)
                    throw new Error("Registrar address invalid");
                data = contract.methods.registrarBurnAllFrom(address).encodeABI();
                return [4 /*yield*/, web3.eth.accounts
                        .signTransaction(__assign(__assign({}, tx), { data: data }), privateKey)
                        .then(function (signed) {
                        web3.eth
                            .sendSignedTransaction(signed.rawTransaction)
                            .then(function (response) {
                            res.status(201);
                            res.json({
                                message: "Registrar burn all success.",
                                transactionHash: response.transactionHash,
                                blockNumber: response.blockNumber,
                            });
                        })
                            .catch(function (err) {
                            res.status(400);
                            res.json({ message: err.message });
                        });
                    })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                error_11 = _b.sent();
                res.status(400);
                res.json({ message: error_11.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
