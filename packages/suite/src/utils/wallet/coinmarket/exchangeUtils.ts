import { ExchangeInfo } from '@suite/actions/wallet/coinmarketExchangeActions';
import { AmountLimits } from '@suite/types/wallet/coinmarketExchangeForm';
import { ExchangeTrade } from 'invity-api';
import { symbolToInvityApiSymbol } from './coinmarketUtils';
import { Account } from '@wallet-types';

// loop through quotes and if all quotes are either with error below minimum or over maximum, return error message
export function getAmountLimits(quotes: ExchangeTrade[]): AmountLimits | undefined {
    let min: number | undefined;
    let max: number | undefined;
    // eslint-disable-next-line no-restricted-syntax
    for (const quote of quotes) {
        let noError = true;
        const amount = Number(quote.sendStringAmount);
        if (quote.min && amount < quote.min) {
            min = Math.min(min || 1e28, quote.min);
            noError = false;
        }
        if (quote.max && quote.max !== 'NONE' && amount > quote.max) {
            max = Math.max(max || 0, quote.max);
            noError = false;
        }
        // if at least one quote succeeded do not return any message
        if (!quote.error && noError) {
            return;
        }
    }
    if (min || max) {
        return { currency: quotes[0].send || '', min, max };
    }
}

export function isQuoteError(quote: ExchangeTrade): boolean {
    if (
        quote.error ||
        !quote.receive ||
        !quote.receiveStringAmount ||
        !quote.sendStringAmount ||
        !quote.send
    ) {
        return true;
    }
    if (quote.min && Number(quote.sendStringAmount) < quote.min) {
        return true;
    }
    if (quote.max && quote.max !== 'NONE' && Number(quote.sendStringAmount) > quote.max) {
        return true;
    }
    return false;
}

// return 3 arrays: quotes not in error, quotes with min/max error, quotes with general error
function splitQuotes(quotes: ExchangeTrade[]): [ExchangeTrade[], ExchangeTrade[], ExchangeTrade[]] {
    return [
        quotes.filter(q => !isQuoteError(q)),
        quotes.filter(q => isQuoteError(q) && !q.error),
        quotes.filter(q => q.error),
    ];
}

export function splitToFixedFloatQuotes(
    quotes: ExchangeTrade[],
    exchangeInfo: ExchangeInfo | undefined,
): [ExchangeTrade[], ExchangeTrade[]] {
    const [fixedOK, fixedMinMax, fixedError] = splitQuotes(
        quotes.filter(q => exchangeInfo?.providerInfos[q.exchange || '']?.isFixedRate) || [],
    );
    const [floatOK, floatMinMax, floatError] = splitQuotes(
        quotes.filter(q => !exchangeInfo?.providerInfos[q.exchange || '']?.isFixedRate) || [],
    );

    // if there are some OK quotes, do not show errors
    const fixedQuotes =
        // eslint-disable-next-line no-nested-ternary
        fixedOK.length > 0
            ? fixedOK.concat(fixedMinMax)
            : floatOK.length > 0
            ? []
            : fixedMinMax.concat(fixedError);
    const floatQuotes =
        // eslint-disable-next-line no-nested-ternary
        floatOK.length > 0
            ? floatOK.concat(floatMinMax)
            : fixedOK.length > 0
            ? []
            : floatMinMax.concat(floatError);
    return [fixedQuotes, floatQuotes];
}

export const getSellCryptoOptions = (account: Account, exchangeInfo?: ExchangeInfo) => {
    const uppercaseSymbol = account.symbol.toUpperCase();
    const options: { value: string; label: string }[] = [
        { value: uppercaseSymbol, label: uppercaseSymbol },
    ];

    if (account.networkType === 'ethereum' && account.tokens) {
        account.tokens.forEach(token => {
            if (token.symbol) {
                const invityToken = symbolToInvityApiSymbol(token.symbol);
                if (exchangeInfo?.sellSymbols.has(invityToken)) {
                    options.push({
                        label: token.symbol.toUpperCase(),
                        value: invityToken.toUpperCase(),
                    });
                }
            }
        });
    }

    return options;
};

// TODO - split by supported and unsupported, sort and probably add coin name
export const getBuyCryptoOptions = (account: Account, exchangeInfo?: ExchangeInfo) => {
    const options: { value: string; label: string }[] = [];

    if (!exchangeInfo) return null;

    exchangeInfo.buySymbols.forEach(token => {
        if (account.symbol !== token) {
            const invityToken = symbolToInvityApiSymbol(token);
            options.push({
                label: token.toUpperCase(),
                value: invityToken.toUpperCase(),
            });
        }
    });

    return options;
};
