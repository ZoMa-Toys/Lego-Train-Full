/// <reference types="node" />
import { Device } from "./device";
import { IDeviceInterface } from "../interfaces";
/**
 * @class MarioBarcodeSensor
 * @extends Device
 */
export declare class MarioBarcodeSensor extends Device {
    constructor(hub: IDeviceInterface, portId: number);
    receive(message: Buffer): void;
}
export declare enum Mode {
    BARCODE = 0,
    RGB = 1
}
export declare const ModeMap: {
    [event: string]: number;
};
