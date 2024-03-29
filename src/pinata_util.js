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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinSingleMetadataFromDir = exports.uploadAndPinIpfsMetadata = exports.pinata = void 0;
require('dotenv').config();
var stream_1 = require("stream");
var fs_1 = __importDefault(require("fs"));
// @ts-ignore
var sdk_1 = __importDefault(require("@pinata/sdk"));
var utils_1 = require("./utils");
var defaultOptions = {
    pinataOptions: {
        cidVersion: 1,
    },
};
exports.pinata = (0, sdk_1.default)(process.env.PINATA_KEY, process.env.PINATA_SECRET);
var fsPromises = fs_1.default.promises;
var pinFileStreamToIpfs = function (file, name) { return __awaiter(void 0, void 0, void 0, function () {
    var options, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                options = __assign(__assign({}, defaultOptions), { pinataMetadata: { name: name } });
                return [4 /*yield*/, exports.pinata.pinFileToIPFS(file, options)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.IpfsHash];
        }
    });
}); };
var uploadAndPinIpfsMetadata = function (metadataFields) { return __awaiter(void 0, void 0, void 0, function () {
    var name, metadata, options, metadata_1, metadataHashResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = metadataFields.name;
                metadata = {
                    name: name
                };
                options = __assign(__assign({}, defaultOptions), { pinataMetadata: metadata });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                metadata_1 = __assign({}, metadataFields);
                return [4 /*yield*/, exports.pinata.pinJSONToIPFS(metadata_1, options)];
            case 2:
                metadataHashResult = _a.sent();
                return [2 /*return*/, "ipfs://ipfs/" + metadataHashResult.IpfsHash];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, ''];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.uploadAndPinIpfsMetadata = uploadAndPinIpfsMetadata;
var pinSingleMetadataFromDir = function (dir, path, name, metadataBase) { return __awaiter(void 0, void 0, void 0, function () {
    var imageFile, stream, imageCid, metadata, metadataCid, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, fsPromises.readFile(process.cwd() + "/" + dir + "/" + path)];
            case 1:
                imageFile = _a.sent();
                if (!imageFile) {
                    throw new Error('No image file');
                }
                stream = stream_1.Readable.from(imageFile);
                stream.path = path;
                return [4 /*yield*/, pinFileStreamToIpfs(stream, name)];
            case 2:
                imageCid = _a.sent();
                console.log("NFT " + path + " IMAGE CID: ", imageCid);
                metadata = __assign(__assign({}, metadataBase), { name: name, image: "ipfs://ipfs/" + imageCid });
                return [4 /*yield*/, (0, exports.uploadAndPinIpfsMetadata)(metadata)];
            case 3:
                metadataCid = _a.sent();
                return [4 /*yield*/, (0, utils_1.sleep)(500)];
            case 4:
                _a.sent();
                console.log("NFT " + name + " METADATA: ", metadataCid);
                return [2 /*return*/, metadataCid];
            case 5:
                error_2 = _a.sent();
                console.log(error_2);
                console.log(JSON.stringify(error_2));
                return [2 /*return*/, ''];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.pinSingleMetadataFromDir = pinSingleMetadataFromDir;
