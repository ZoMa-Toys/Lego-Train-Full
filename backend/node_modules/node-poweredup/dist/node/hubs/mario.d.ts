import { Peripheral } from "@abandonware/noble";
import { IBLEAbstraction } from "../interfaces";
import { LPF2Hub } from "./lpf2hub";
/**
 * Mario is emitted if the discovered device is a LEGO Super Mario brick.
 * @class Mario
 * @extends LPF2Hub
 * @extends BaseHub
 */
export declare class Mario extends LPF2Hub {
    static IsMario(peripheral: Peripheral): boolean;
    constructor(device: IBLEAbstraction);
    connect(): Promise<void>;
}
export declare const PortMap: {
    [portName: string]: number;
};
