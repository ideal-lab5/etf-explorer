'use client'
import "reflect-metadata";
import { Avatar } from '@/components/avatar'
import {
    Dropdown,
    DropdownButton,
    DropdownItem,
    DropdownLabel,
    DropdownMenu
} from '@/components/dropdown'
import {
    SidebarFooter,
    SidebarItem,
} from '@/components/sidebar'
import {
    ChevronUpIcon,
} from '@heroicons/react/16/solid'

import { useState } from 'react'
import { Button } from "@/components/button";
import { Dialog, DialogTitle } from "@/components/dialog";
import { Text } from "@/components/text";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useConnectedWallet } from "@/components/etf/ConnectedWalletContext";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/20/solid";
import { container } from "tsyringe";
import { ExplorerService } from "@/services/ExplorerService";

const explorerServiceInstance = container.resolve(ExplorerService);

export function AccountDropdownMenu({ anchor }: { readonly anchor: 'top start' | 'bottom end' }) {
    const { setSignerAddress, setSigner, setIsConnected } = useConnectedWallet();

    const disconnect = () => {
        setSignerAddress("");
        setSigner(null);
        setIsConnected(false);
    }

    return (
        <DropdownMenu className="min-w-64" anchor={anchor}>
            <DropdownItem href="#" onClick={(e: any) => { e.preventDefault(); disconnect(); }}>
                <ArrowRightStartOnRectangleIcon />
                <DropdownLabel>Disconnect</DropdownLabel>
            </DropdownItem>
        </DropdownMenu>
    )
}

export const ConnectWallet: React.FC<{ buttonOnly: boolean }> = ({ buttonOnly = false }) => {
    const { setSigner, isConnected, setIsConnected, signerAddress, setSignerAddress,
        signerBalance, setSignerBalance } = useConnectedWallet();

    const [showWalletSelection, setShowWalletSelection] = useState(false);
    const [availableAccounts, setAvailableAccounts] = useState<any>([]);

    async function connect() {
        if (typeof window !== "undefined") {
            // Client-side-only code
            const ext = await import("@polkadot/extension-dapp");
            const _ = await ext.web3Enable('etf-auction');
            const allAccounts = await ext.web3Accounts();
            setAvailableAccounts(allAccounts);
        }
    }

    // Handler for the click event of the `Connect` button on the NavBar.
    const handleConnect = async () => {
        await connect();
        setShowWalletSelection(true);
    }

    const handleSelectWallet = (account: any) => async () => {
        const ext = await import("@polkadot/extension-dapp");
        let address = account.address
        // finds an injector for an address
        const injector = await ext.web3FromAddress(address);
        const accountDetails = { signer: injector.signer, address };
        setSigner(accountDetails);
        setSignerBalance(await explorerServiceInstance.getFreeBalance(accountDetails));
        setSignerAddress(address);
        setIsConnected(true);
        setShowWalletSelection(false);
    }

    return (
        <>
            {buttonOnly ?
                <Button onClick={(e: any) => { e.preventDefault(); handleConnect(); }} color="cyan" className="cursor-pointer">Connect</Button>
                : <>
                    <SidebarFooter className="max-lg:hidden">
                        {isConnected ? <Dropdown>
                            <DropdownButton as={SidebarItem}>
                                <span className="flex min-w-0 items-center gap-3">
                                    <Avatar src="/ideal/sticker-vertical.png" className="size-10" square alt="" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">Connected</span>
                                        <span className="block truncate text-xs/5 font-normal text-green-500 dark:text-green-500">Balance: {signerBalance} IDN</span>
                                        <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                                            {`${signerAddress.substring(0, 4)}...${signerAddress.substring(signerAddress.length - 4, signerAddress.length)}`}
                                        </span>
                                    </span>
                                </span>
                                <ChevronUpIcon />
                            </DropdownButton>
                            <AccountDropdownMenu anchor="top start" />
                        </Dropdown> : <Button onClick={(e: any) => { e.preventDefault(); handleConnect(); }} color="cyan" className="cursor-pointer">Connect</Button>}
                    </SidebarFooter>
                </>}
            <Dialog
                open={showWalletSelection}
                onClose={() => setShowWalletSelection(false)}
                size="lg"

            >
                <DialogTitle>Select a wallet</DialogTitle>
                {availableAccounts?.length > 0 ?
                    <Table className="mt-4 [--gutter:theme(spacing.6)] lg:[--gutter:theme(spacing.10)]">
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Address</TableHeader>
                                <TableHeader></TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {availableAccounts.map((account: any, index: number) => (
                                <TableRow key={"wallet" + index}>
                                    <TableCell className="font-medium">
                                        {account.meta.name}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {`${account.address.substring(0, 4)} ... ${account.address.substring(account.address.length - 4, account.address.length)}`}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            color="cyan"
                                            onClick={handleSelectWallet(account)}
                                            className="cursor-pointer"
                                        >
                                            Connect
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    : <div className="rounded-md p-4">
                        <div className="flex">
                            <Text>You need polkadotjs and at least one wallet to use this app.</Text>
                        </div>
                    </div>}
            </Dialog>
        </>);
};
