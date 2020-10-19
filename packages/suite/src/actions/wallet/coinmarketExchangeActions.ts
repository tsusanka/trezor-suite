import { Account, Network } from '@wallet-types';
import { FeeLevel } from 'trezor-connect';
import * as exchangeFormBitcoinActions from './exchange/exchangeFormBitcoinActions';
import * as exchangeFormEthereumActions from './exchange/exchangeFormEthereumActions';
import * as exchangeFormRippleActions from './exchange/exchangeFormRippleActions';
import {
    ExchangeListResponse,
    ExchangeProviderInfo,
    ExchangeTradeQuoteRequest,
    ExchangeTrade,
    ExchangeCoinInfo,
} from 'invity-api';
import invityAPI from '@suite-services/invityAPI';
import { COINMARKET_EXCHANGE } from './constants';
import { Dispatch } from '@suite-types';
import * as modalActions from '@suite-actions/modalActions';
import {
    FeeInfo,
    PrecomposedTransactionNonFinal,
    PrecomposedTransactionFinal,
} from '@wallet-types/sendForm';

export interface ExchangeInfo {
    exchangeList?: ExchangeListResponse;
    providerInfos: { [name: string]: ExchangeProviderInfo };
    buySymbols: Set<string>;
    sellSymbols: Set<string>;
}

export type CoinmarketExchangeActions =
    | { type: typeof COINMARKET_EXCHANGE.SAVE_EXCHANGE_INFO; exchangeInfo: ExchangeInfo }
    | {
          type: typeof COINMARKET_EXCHANGE.SAVE_EXCHANGE_COIN_INFO;
          exchangeCoinInfo: ExchangeCoinInfo[];
      }
    | { type: typeof COINMARKET_EXCHANGE.SAVE_QUOTE_REQUEST; request: ExchangeTradeQuoteRequest }
    | { type: typeof COINMARKET_EXCHANGE.SAVE_TRANSACTION_ID; transactionId: string }
    | { type: typeof COINMARKET_EXCHANGE.VERIFY_ADDRESS; addressVerified: string }
    | {
          type: typeof COINMARKET_EXCHANGE.SAVE_QUOTES;
          fixedQuotes: ExchangeTrade[];
          floatQuotes: ExchangeTrade[];
      }
    | {
          type: typeof COINMARKET_EXCHANGE.SAVE_TRADE;
          date: string;
          key?: string;
          tradeType: 'exchange';
          data: ExchangeTrade;
          account: {
              symbol: Account['symbol'];
              descriptor: Account['descriptor'];
              accountIndex: Account['index'];
              accountType: Account['accountType'];
          };
      }
    | {
          type: typeof COINMARKET_EXCHANGE.SAVE_TRANSACTION_INFO;
          transactionInfo: PrecomposedTransactionNonFinal | PrecomposedTransactionFinal;
      };

export async function loadExchangeInfo(): Promise<[ExchangeInfo, ExchangeCoinInfo[]]> {
    const [exchangeList, exchangeCoinInfo] = await Promise.all([
        invityAPI.getExchangeList(),
        invityAPI.getExchangeCoins(),
    ]);

    if (
        !exchangeList ||
        exchangeList.length === 0 ||
        !exchangeCoinInfo ||
        exchangeCoinInfo.length === 0
    ) {
        return [{ providerInfos: {}, buySymbols: new Set(), sellSymbols: new Set() }, []];
    }

    const providerInfos: { [name: string]: ExchangeProviderInfo } = {};
    exchangeList.forEach(e => (providerInfos[e.name] = e));

    // merge symbols supported by at least one partner
    const buySymbolsArray: string[] = [];
    const sellSymbolsArray: string[] = [];
    exchangeList.forEach(p => {
        if (p.buyTickers) {
            buySymbolsArray.push(...p.buyTickers.map(c => c.toLowerCase()));
        }
        if (p.sellTickers) {
            sellSymbolsArray.push(...p.sellTickers.map(c => c.toLowerCase()));
        }
    });

    // allow only symbols which are supported by partners and at the same time in the list of supported coins by invityAPI
    const allBuySymbols = new Set(buySymbolsArray);
    const buySymbols = new Set<string>();
    const allSellSymbols = new Set(sellSymbolsArray);
    const sellSymbols = new Set<string>();
    exchangeCoinInfo.forEach(ci => {
        const symbol = ci.ticker.toLowerCase();
        if (allBuySymbols.has(symbol)) buySymbols.add(symbol);
        if (allSellSymbols.has(symbol)) sellSymbols.add(symbol);
    });

    return [
        {
            exchangeList,
            providerInfos,
            buySymbols,
            sellSymbols,
        },
        exchangeCoinInfo,
    ];
}

export const saveExchangeInfo = (exchangeInfo: ExchangeInfo) => async (dispatch: Dispatch) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_EXCHANGE_INFO,
        exchangeInfo,
    });
};

export const saveExchangeCoinInfo = (exchangeCoinInfo: ExchangeCoinInfo[]) => async (
    dispatch: Dispatch,
) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_EXCHANGE_COIN_INFO,
        exchangeCoinInfo,
    });
};

// this is only a wrapper for `openDeferredModal` since it doesn't work with `bindActionCreators`
// used in useCoinmarketExchangeOffers
export const openCoinmarketExchangeConfirmModal = (provider?: string) => (dispatch: Dispatch) => {
    return dispatch(
        modalActions.openDeferredModal({ type: 'coinmarket-exchange-terms', provider }),
    );
};

export const saveTrade = (exchangeTrade: ExchangeTrade, account: Account, date: string) => async (
    dispatch: Dispatch,
) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_TRADE,
        tradeType: 'exchange',
        key: exchangeTrade.orderId,
        date,
        data: exchangeTrade,
        account: {
            descriptor: account.descriptor,
            symbol: account.symbol,
            accountType: account.accountType,
            accountIndex: account.index,
        },
    });
};

export const saveQuoteRequest = (request: ExchangeTradeQuoteRequest) => async (
    dispatch: Dispatch,
) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_QUOTE_REQUEST,
        request,
    });
};

export const saveTransactionId = (transactionId: string) => async (dispatch: Dispatch) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_TRANSACTION_ID,
        transactionId,
    });
};

export const saveTransactionInfo = (
    transactionInfo: PrecomposedTransactionNonFinal | PrecomposedTransactionFinal,
) => async (dispatch: Dispatch) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_TRANSACTION_INFO,
        transactionInfo,
    });
};

export const saveQuotes = (fixedQuotes: ExchangeTrade[], floatQuotes: ExchangeTrade[]) => async (
    dispatch: Dispatch,
) => {
    dispatch({
        type: COINMARKET_EXCHANGE.SAVE_QUOTES,
        fixedQuotes,
        floatQuotes,
    });
};

export interface ComposeTransactionData {
    account: Account;
    amount: string;
    feeInfo: FeeInfo;
    feePerUnit: string;
    feeLimit: string;
    network: Network;
    selectedFee: FeeLevel['label'];
    isMaxActive: boolean;
    address?: string;
    token?: string;
}

export const composeTransaction = (composeTransactionData: ComposeTransactionData) => async (
    dispatch: Dispatch,
) => {
    const { account } = composeTransactionData;
    if (account.networkType === 'bitcoin') {
        return dispatch(exchangeFormBitcoinActions.composeTransaction(composeTransactionData));
    }
    if (account.networkType === 'ethereum') {
        return dispatch(exchangeFormEthereumActions.composeTransaction(composeTransactionData));
    }
    if (account.networkType === 'ripple') {
        return dispatch(exchangeFormRippleActions.composeTransaction(composeTransactionData));
    }
};

export interface SignTransactionData {
    account: Account;
    address: string;
    amount: string;
    network: Network;
    destinationTag?: string;
    transactionInfo: PrecomposedTransactionNonFinal | PrecomposedTransactionFinal;
}

export const signTransaction = (signTransactionData: SignTransactionData) => async (
    dispatch: Dispatch,
) => {
    const { account } = signTransactionData;
    if (account.networkType === 'bitcoin') {
        // @ts-ignore
        return dispatch(exchangeFormBitcoinActions.signTransaction(signTransactionData));
    }
    if (account.networkType === 'ethereum') {
        return dispatch(exchangeFormEthereumActions.signTransaction(signTransactionData));
    }
    if (account.networkType === 'ripple') {
        return dispatch(exchangeFormRippleActions.signTransaction(signTransactionData));
    }
};
