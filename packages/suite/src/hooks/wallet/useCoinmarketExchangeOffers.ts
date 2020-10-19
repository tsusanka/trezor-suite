import { createContext, useContext, useState, useEffect } from 'react';
import invityAPI from '@suite-services/invityAPI';
import { useActions } from '@suite-hooks';
import { ExchangeCoinInfo, ExchangeTrade } from 'invity-api';
import * as coinmarketCommonActions from '@wallet-actions/coinmarketCommonActions';
import * as coinmarketExchangeActions from '@wallet-actions/coinmarketExchangeActions';
import * as routerActions from '@suite-actions/routerActions';
import { Account } from '@wallet-types';
import { Props, ContextValues, ExchangeStep } from '@wallet-types/coinmarketExchangeOffers';
import { useSelector } from 'react-redux';
import { AppState } from '@suite/types/suite';
import * as notificationActions from '@suite-actions/notificationActions';
import { splitToFixedFloatQuotes } from '@wallet-utils/coinmarket/exchangeUtils';
import networks from '@wallet-config/networks';
import { getUnusedAddressFromAccount } from '@wallet-utils/coinmarket/coinmarketUtils';

const getReceiveAccountSymbol = (
    symbol?: string,
    exchangeCoinInfo?: ExchangeCoinInfo[],
): string | undefined => {
    if (symbol) {
        // check if the symbol is ETH token, in that case use ETH network as receiving account
        const coinInfo = exchangeCoinInfo?.find(ci => ci.ticker === symbol);
        if (coinInfo?.token === 'ETH') {
            return 'eth';
        }
        return symbol.toLowerCase();
    }
    return symbol;
};

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

    const { account, network } = selectedAccount;
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
        signTransaction,
        addNotification,
    } = useActions({
        saveTrade: coinmarketExchangeActions.saveTrade,
        openCoinmarketExchangeConfirmModal:
            coinmarketExchangeActions.openCoinmarketExchangeConfirmModal,
        saveTransactionId: coinmarketExchangeActions.saveTransactionId,
        signTransaction: coinmarketExchangeActions.signTransaction,
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

    const transactionInfo = useSelector<
        AppState,
        AppState['wallet']['coinmarket']['exchange']['transactionInfo']
    >(state => state.wallet.coinmarket.exchange.transactionInfo);

    const exchangeCoinInfo = useSelector<
        AppState,
        AppState['wallet']['coinmarket']['exchange']['exchangeCoinInfo']
    >(state => state.wallet.coinmarket.exchange.exchangeCoinInfo);

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

    const receiveSymbol = getReceiveAccountSymbol(selectedQuote?.receive, exchangeCoinInfo);

    useEffect(() => {
        if (selectedQuote && exchangeStep === 'RECEIVING_ADDRESS') {
            const unavailableCapabilities =
                device?.features && device?.unavailableCapabilities
                    ? device.unavailableCapabilities
                    : {};
            // is the symbol supported by the suite and the device natively
            const buyNetworks = networks.filter(
                n => n.symbol === receiveSymbol && !unavailableCapabilities[n.symbol],
            );
            if (buyNetworks.length > 0) {
                // are there some accounts with the symbol
                setSuiteBuyAccounts(
                    accounts.filter(
                        a =>
                            a.symbol === receiveSymbol &&
                            (!a.empty ||
                                a.visible ||
                                (a.accountType === 'normal' && a.index === 0)),
                    ),
                );
                return;
            }
        }
        setSuiteBuyAccounts(undefined);
    }, [accounts, device, exchangeStep, receiveSymbol, selectedQuote]);

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
            setExchangeStep('SEND_TRANSACTION');
            setSelectedQuote(response);
        }
    };

    const sendTransaction = async () => {
        if (
            selectedQuote &&
            selectedQuote.orderId &&
            selectedQuote.sendAddress &&
            transactionInfo &&
            transactionInfo?.totalSpent
        ) {
            await signTransaction({
                account,
                address: selectedQuote.sendAddress,
                transactionInfo,
                network,
                amount: transactionInfo.totalSpent,
            });
            await saveTrade(selectedQuote, account, new Date().toISOString());
            await saveTransactionId(selectedQuote.orderId);
            goto('wallet-coinmarket-exchange-detail', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
        } else {
            addNotification({
                type: 'error',
                error: 'Cannot send transaction, missing data',
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
        receiveSymbol,
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
