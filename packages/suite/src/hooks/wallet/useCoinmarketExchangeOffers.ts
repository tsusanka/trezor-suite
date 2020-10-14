import { createContext, useContext, useState, useEffect } from 'react';
import invityAPI from '@suite-services/invityAPI';
import { useActions } from '@suite-hooks';
import { ExchangeTrade } from 'invity-api';
import * as coinmarketCommonActions from '@wallet-actions/coinmarketCommonActions';
import * as coinmarketExchangeActions from '@wallet-actions/coinmarketExchangeActions';
import * as routerActions from '@suite-actions/routerActions';
import { Props, ContextValues, ExchangeStep } from '@wallet-types/coinmarketExchangeOffers';
import { useSelector } from 'react-redux';
import { AppState } from '@suite/types/suite';
// import * as notificationActions from '@suite-actions/notificationActions';
import { splitToFixedFloatQuotes } from '@wallet-utils/coinmarket/exchangeUtils';
import networks from '@wallet-config/networks';

export const useOffers = (props: Props) => {
    const REFETCH_INTERVAL = 30000;
    const {
        selectedAccount,
        quotesRequest,
        fixedQuotes,
        floatQuotes,
        exchangeInfo,
        device,
        addressVerified,
    } = props;

    const { account } = selectedAccount;
    const [selectedQuote, setSelectedQuote] = useState<ExchangeTrade>();
    const [suiteBuyAccounts, setSuiteBuyAccounts] = useState<ContextValues['suiteBuyAccounts']>();
    const [innerFixedQuotes, setInnerFixedQuotes] = useState<ExchangeTrade[]>(fixedQuotes);
    const [innerFloatQuotes, setInnerFloatQuotes] = useState<ExchangeTrade[]>(floatQuotes);
    const [exchangeStep, setExchangeStep] = useState<ExchangeStep>('RECEIVING_ADDRESS');
    const [lastFetchDate, setLastFetchDate] = useState(new Date());
    const { goto } = useActions({ goto: routerActions.goto });
    const { verifyAddress } = useActions({ verifyAddress: coinmarketCommonActions.verifyAddress });
    const {
        saveTrade,
        openCoinmarketExchangeConfirmModal,
        // addNotification,
    } = useActions({
        saveTrade: coinmarketExchangeActions.saveTrade,
        openCoinmarketExchangeConfirmModal:
            coinmarketExchangeActions.openCoinmarketExchangeConfirmModal,
        // addNotification: notificationActions.addToast,
    });

    const invityAPIUrl = useSelector<
        AppState,
        AppState['suite']['settings']['debug']['invityAPIUrl']
    >(state => state.suite.settings.debug.invityAPIUrl);
    if (invityAPIUrl) {
        invityAPI.setInvityAPIServer(invityAPIUrl);
    }

    const accounts = useSelector<AppState, AppState['wallet']['accounts']>(
        state => state.wallet.accounts,
    );

    useEffect(() => {
        if (!quotesRequest) {
            goto('wallet-coinmarket-exchange', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
            return;
        }

        const getQuotes = async () => {
            if (!selectedQuote) {
                invityAPI.createInvityAPIKey(account.descriptor);
                const allQuotes = await invityAPI.getExchangeQuotes(quotesRequest);
                const [fixedQuotes, floatQuotes] = splitToFixedFloatQuotes(allQuotes, exchangeInfo);
                setInnerFixedQuotes(fixedQuotes);
                setInnerFloatQuotes(floatQuotes);
            }
        };

        const interval = setInterval(() => {
            getQuotes();
            setLastFetchDate(new Date());
        }, REFETCH_INTERVAL);

        return () => clearInterval(interval);
    });

    const selectQuote = async (quote: ExchangeTrade) => {
        const provider =
            exchangeInfo?.providerInfos && quote.exchange
                ? exchangeInfo?.providerInfos[quote.exchange]
                : null;
        if (quotesRequest) {
            const result = await openCoinmarketExchangeConfirmModal(provider?.companyName);
            if (result) {
                setSelectedQuote(quote);
            }
        }
    };

    useEffect(() => {
        if (selectedQuote) {
            const buySymbol = selectedQuote.receive?.toLowerCase();
            const unavailableCapabilities =
                device?.features && device?.unavailableCapabilities
                    ? device.unavailableCapabilities
                    : {};
            // is the symbol supported by the suite and the device natively
            const buyNetworks = networks.filter(
                n => n.symbol === buySymbol && !unavailableCapabilities[n.symbol],
            );
            if (buyNetworks.length > 0) {
                // are there some accounts with the symbol
                setSuiteBuyAccounts(
                    accounts.filter(
                        a =>
                            a.symbol === buySymbol &&
                            (!a.empty ||
                                a.visible ||
                                (a.accountType === 'normal' && a.index === 0)),
                    ),
                );
                return;
            }
        }
        setSuiteBuyAccounts(undefined);
    }, [accounts, device, selectedQuote]);

    const doTrade = async (_address: string, _extraField?: string) => {
        // if (!selectedQuote) return;
        // const quote = { ...selectedQuote, receiveAddress: address };
        // const response = await invityAPI.doExchangeTrade({
        //     trade: quote,
        //     returnUrl: createTxLink(selectedQuote, account),
        // });
        // if (!response || !response.trade || !response.trade.paymentId) {
        //     console.log('invalid response', response);
        //     addNotification({
        //         type: 'error',
        //         error: 'No response from the server',
        //     });
        // } else if (response.trade.error) {
        //     console.log('response error', response.trade.error);
        //     addNotification({
        //         type: 'error',
        //         error: response.trade.error,
        //     });
        // } else {
        //     await saveTrade(response.trade, account, new Date().toISOString());
        //     // eslint-disable-next-line no-lonely-if
        //     if (response.tradeForm) {
        //         submitRequestForm(response.tradeForm);
        //     }
        // }
    };

    return {
        doTrade,
        selectedQuote,
        suiteBuyAccounts,
        verifyAddress,
        device,
        lastFetchDate,
        exchangeInfo,
        exchangeStep,
        setExchangeStep,
        saveTrade,
        quotesRequest,
        addressVerified,
        fixedQuotes: innerFixedQuotes,
        floatQuotes: innerFloatQuotes,
        selectQuote,
        account,
        REFETCH_INTERVAL,
    };
};

export const CoinmarketExchangeOffersContext = createContext<ContextValues | null>(null);
CoinmarketExchangeOffersContext.displayName = 'CoinmarketExchangeOffersContext';

export const useCoinmarketExchangeOffersContext = () => {
    const context = useContext(CoinmarketExchangeOffersContext);
    if (context === null) throw Error('CoinmarketExchangeOffersContext used without Context');
    return context;
};
