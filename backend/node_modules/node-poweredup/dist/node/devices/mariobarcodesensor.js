"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeMap = exports.Mode = exports.MarioBarcodeSensor = void 0;
const device_1 = require("./device");
const Consts = __importStar(require("../consts"));
/**
 * @class MarioBarcodeSensor
 * @extends Device
 */
class MarioBarcodeSensor extends device_1.Device {
    constructor(hub, portId) {
        super(hub, portId, exports.ModeMap, Consts.DeviceType.MARIO_BARCODE_SENSOR);
    }
    receive(message) {
        const mode = this._mode;
        switch (mode) {
            case Mode.BARCODE:
                /**
                 * Emits when the barcode sensor sees a barcode.
                 * @event MarioBarcodeSensor#barcode
                 * @type {object}
                 * @param {number} id
                 */
                const barcode = message.readUInt16LE(4);
                const color = message.readUInt16LE(6);
                if (color === 0xffff) {
                    // This is a barcode
                    this.notify("barcode", { barcode });
                }
                else if (barcode === 0xffff) {
                    // This is a color
                    this.notify("barcode", { color });
                }
                break;
            case Mode.RGB:
                /**
                 * Emits when the barcode sensor sees a RGB color.
                 * @event MarioBarcodeSensor#rgb
                 * @type {object}
                 * @param {number} r
                 * @param {number} g
                 * @param {number} b
                 */
                const r = message[4];
                const g = message[5];
                const b = message[6];
                this.notify("rgb", { r, g, b });
                break;
        }
    }
}
exports.MarioBarcodeSensor = MarioBarcodeSensor;
var Mode;
(function (Mode) {
    Mode[Mode["BARCODE"] = 0] = "BARCODE";
    Mode[Mode["RGB"] = 1] = "RGB";
})(Mode = exports.Mode || (exports.Mode = {}));
exports.ModeMap = {
    "barcode": Mode.BARCODE,
    "rgb": Mode.RGB,
};
//# sourceMappingURL=mariobarcodesensor.js.map