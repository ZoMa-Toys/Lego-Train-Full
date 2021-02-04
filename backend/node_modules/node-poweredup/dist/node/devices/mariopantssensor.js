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
exports.ModeMap = exports.Mode = exports.MarioPantsSensor = void 0;
const device_1 = require("./device");
const Consts = __importStar(require("../consts"));
/**
 * @class MarioPantsSensor
 * @extends Device
 */
class MarioPantsSensor extends device_1.Device {
    constructor(hub, portId) {
        super(hub, portId, exports.ModeMap, Consts.DeviceType.MARIO_PANTS_SENSOR);
    }
    receive(message) {
        const mode = this._mode;
        switch (mode) {
            case Mode.PANTS:
                /**
                 * Emits when the user changes the pants on Mario.
                 * @event MarioPantsSensor#pants
                 * @type {object}
                 * @param {number} pants
                 */
                const pants = message[4];
                this.notify("pants", { pants });
                break;
        }
    }
}
exports.MarioPantsSensor = MarioPantsSensor;
var Mode;
(function (Mode) {
    Mode[Mode["PANTS"] = 0] = "PANTS";
})(Mode = exports.Mode || (exports.Mode = {}));
exports.ModeMap = {
    "pants": Mode.PANTS,
};
//# sourceMappingURL=mariopantssensor.js.map