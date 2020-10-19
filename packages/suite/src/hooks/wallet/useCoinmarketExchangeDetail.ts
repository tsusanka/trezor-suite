import { createContext, useContext } from 'react';
import { Props, ContextValues } from '@wallet-types/coinmarketExchangeDetail';
import { useWatchExchangeTrade } from '@wallet-hooks/useCoinmarket';
import { useSelector } from 'react-redux';
import { TradeExchange } from '@wallet-reducers/coinmarketReducer';
import { AppState } from '@suite-types';
import invityAPI from '@suite-services/invityAPI';

export const useCoinmarketExchangeDetail = (props: Props) => {
    const { selectedAccount, trades, transactionId } = props;
    const exchangeTrade = trades.find(
        trade => trade.tradeType === 'exchange' && trade.key === transactionId,
    );
    const { account } = selectedAccount;
    const invityAPIUrl = useSelector<
        AppState,
        AppState['suite']['settings']['debug']['invityAPIUrl']
    >(state => state.suite.settings.debug.invityAPIUrl);
    if (invityAPIUrl) {
        invityAPI.setInvityAPIServer(invityAPIUrl);
    }
    const exchangeInfo = useSelector<
        AppState,
        AppState['wallet']['coinmarket']['exchange']['exchangeInfo']
    >(state => state.wallet.coinmarket.exchange.exchangeInfo);
    useWatchExchangeTrade(account, exchangeTrade as TradeExchange);

    return {
        account,
        trade: exchangeTrade as TradeExchange | undefined,
        transactionId,
        exchangeInfo,
    };
};

export const CoinmarketExchangeDetailContext = createContext<ContextValues | null>(null);
CoinmarketExchangeDetailContext.displayName = 'CoinmarketExchangeDetailContext';

export const useCoinmarketExchangeDetailContext = () => {
    const context = useContext(CoinmarketExchangeDetailContext);
    if (context === null) throw Error('CoinmarketExchangeDetailContext used without Context');
    return context;
};
