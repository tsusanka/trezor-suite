import { Account } from '@wallet-types';

export const buildOption = (currency: string) => {
    return { value: currency, label: currency.toUpperCase() };
};

export const symbolToInvityApiSymbol = (symbol: string) => {
    if (symbol === 'usdt') {
        return 'usdt20';
    }
    return symbol;
};

export function formatCryptoAmount(amount: number, decimals = 8): string {
    let digits = 4;
    if (amount < 1) {
        digits = 6;
    }
    if (amount < 0.01) {
        digits = decimals;
    }
    return amount.toFixed(digits);
}

export const getAccountInfo = (account: Account) => {
    switch (account.networkType) {
        case 'bitcoin': {
            const firstUnused = account.addresses?.unused[0];
            if (firstUnused) {
                return { address: firstUnused.address, path: firstUnused.path };
            }

            return { address: undefined, path: undefined };
        }
        case 'ripple':
        case 'ethereum': {
            return {
                address: account.descriptor,
                path: account.path,
            };
        }
        // no default
    }
};
