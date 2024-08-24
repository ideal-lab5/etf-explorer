import {singleton, container} from "tsyringe";
import { ExplorerService} from "../ExplorerService";

const etfApi = container.resolve(ExplorerService);
@singleton()
export class AccountService{

    address: string = "";
    accountInfo: any;

    constructor() {}; 

    async startService(address: string): Promise<any> {

        this.address = address;

        this.accountInfo = await etfApi.api.api.query.system.account(this.address);

        return Promise.resolve(this.accountInfo);

    }

    getFreeBalance(asString: boolean) {

        let balance;

        if(asString) {
            balance = this.accountInfo.data.free.toHuman();
        } else {
            balance = parseInt(this.accountInfo.data.free.toHuman());
        }

        return balance
    }

    freeService() {
        this.address = "";
        this.accountInfo = undefined;
    }

}