import { singleton } from "tsyringe";
import { IExplorerService } from "./IExplorerService";
import { cryptoWaitReady } from '@polkadot/util-crypto';
import chainSpec from "../etf_spec/dev/etf_spec.json"
import {Etf} from "@ideallabs/etf.js";

@singleton()
export class ExplorerService implements IExplorerService {

    api: any;
    CUSTOM_TYPES: any;
    // chainSpec: any;
    abi: any;
    // etf_spec: string = "./etf_spec/dev/etf_spec.json"

    constructor() {
        console.log("ExplorerService constructor");
        this.getEtfApi().then(() => {
          console.log("Starting AuctionService");
        });
    };

    async getEtfApi(signer = undefined): Promise<any> {
        // ensure params are defined
        if (process.env.NEXT_PUBLIC_NODE_DETAILS === undefined) {
          console.error("Provide a valid value for NEXT_PUBLIC_NODE_DETAILS");
          return Promise.resolve(null);
        }

        if (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS === undefined) {
          console.error("Provide a valid value for NEXT_PUBLIC_CONTRACT_ADDRESS");
          return Promise.resolve(null);
        }

        if (!this.api) {

          try {
            await cryptoWaitReady();
            // const etfjs = await import('@ideallabs/etf.js');
            let api = new Etf(process.env.NEXT_PUBLIC_NODE_DETAILS, true);
            console.log("Connecting to ETF chain");
            await api.init(JSON.stringify(chainSpec), this.CUSTOM_TYPES);
            this.api = api;
            //Loading proxy contract
            // this.contract = new ContractPromise(this.api.api, this.abi, process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
          } catch (_e) {
            // TODO: next will try to fetch the wasm blob but it doesn't need to
            // since the transitive dependency is built with the desired wasm already 
            // so we can ignore this error for now (no impact to functionality)
            // but shall be addressed in the future
          }
        }
        if (signer) {
          this.api.api.setSigner(signer);
        }
        console.log("api initialized")
        return Promise.resolve(this.api);
        // throw new Error("Method not implemented.");
    };

}