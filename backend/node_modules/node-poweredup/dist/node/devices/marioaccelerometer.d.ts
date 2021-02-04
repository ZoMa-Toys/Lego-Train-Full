/// <reference types="node" />
import { Device } from "./device";
import { IDeviceInterface } from "../interfaces";
/**
 * @class MarioAccelerometer
 * @extends Device
 */
export declare class MarioAccelerometer extends Device {
    constructor(hub: IDeviceInterface, portId: number);
    receive(message: Buffer): void;
}
export declare enum Mode {
    ACCEL = 0,
    GEST = 1
}
export declare const ModeMap: {
    [event: string]: number;
};
