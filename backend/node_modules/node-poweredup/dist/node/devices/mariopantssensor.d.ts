/// <reference types="node" />
import { Device } from "./device";
import { IDeviceInterface } from "../interfaces";
/**
 * @class MarioPantsSensor
 * @extends Device
 */
export declare class MarioPantsSensor extends Device {
    constructor(hub: IDeviceInterface, portId: number);
    receive(message: Buffer): void;
}
export declare enum Mode {
    PANTS = 0
}
export declare const ModeMap: {
    [event: string]: number;
};
