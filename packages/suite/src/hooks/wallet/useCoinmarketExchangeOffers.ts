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
import * as notificationActions from '@suite-actions/notificationActions';
import { splitToFixedFloatQuotes } from '@wallet-utils/coinmarket/exchangeUtils';
import networks from '@wallet-config/networks';
import { getUnusedAddressFromAccount } from '@wallet-utils/coinmarket/coinmarketUtils';

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
    const [receiveAccount, setReceiveAccount] = useState<Account | undefined>();
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
        saveTransactionId,
        addNotification,
    } = useActions({
        saveTrade: coinmarketExchangeActions.saveTrade,
        openCoinmarketExchangeConfirmModal:
            coinmarketExchangeActions.openCoinmarketExchangeConfirmModal,
        saveTransactionId: coinmarketExchangeActions.saveTransactionId,
        addNotification: notificationActions.addToast,
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
        if (selectedQuote && exchangeStep === 'RECEIVING_ADDRESS') {
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
    }, [accounts, device, exchangeStep, selectedQuote]);

    const confirmTrade = async (address: string, extraField?: string) => {
        const { address: refundAddress } = getUnusedAddressFromAccount(account);
        if (!selectedQuote || !refundAddress) return;
        const response = await invityAPI.doExchangeTrade({
            trade: selectedQuote,
            receiveAddress: address,
            refundAddress,
            extraField,
        });
        if (!response) {
            console.log('invalid response', response);
            addNotification({
                type: 'error',
                error: 'No response from the server',
            });
        } else if (response.error || !response.status || !response.orderId) {
            console.log('response error', response.error);
            addNotification({
                type: 'error',
                error: response.error || 'Invalid response from the server',
            });
        } else {
            // await saveTrade(response, account, new Date().toISOString());
            setExchangeStep('SEND_TRANSACTION');
            setSelectedQuote(response);
        }
    };

    const sendTransaction = async () => {
        if (selectedQuote && selectedQuote.orderId) {
            // TODO - create and sign transaction and send it to the network
            await saveTrade(selectedQuote, account, new Date().toISOString());
            await saveTransactionId(selectedQuote.orderId);
            goto('wallet-coinmarket-exchange-detail', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
        }
    };

    return {
        confirmTrade,
        sendTransaction,
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
        receiveAccount,
        setReceiveAccount,
    };
};

export const CoinmarketExchangeOffersContext = createContext<ContextValues | null>(null);
CoinmarketExchangeOffersContext.displayName = 'CoinmarketExchangeOffersContext';

export const useCoinmarketExchangeOffersContext = () => {
    const context = useContext(CoinmarketExchangeOffersContext);
    if (context === null) throw Error('CoinmarketExchangeOffersContext used without Context');
    return context;
};
