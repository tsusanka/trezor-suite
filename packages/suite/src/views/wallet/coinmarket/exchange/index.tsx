import React from 'react';
import { CoinmarketLayout, WalletLayout } from '@wallet-components';
import { AppState } from '@suite-types';
import { ComponentProps } from '@wallet-types/coinmarketExchangeForm';
import { connect } from 'react-redux';
import ExchangeForm from './components/ExchangeForm';
import {
    useCoinmarketExchangeForm,
    ExchangeFormContext,
} from '@wallet-hooks/useCoinmarketExchangeForm';

const mapStateToProps = (state: AppState): ComponentProps => ({
    selectedAccount: state.wallet.selectedAccount,
    quotesRequest: state.wallet.coinmarket.exchange.quotesRequest,
    fiat: state.wallet.fiat,
    localCurrency: state.wallet.settings.localCurrency,
    fees: state.wallet.fees,
});

const CoinmarketExchange = (props: ComponentProps) => {
    const { selectedAccount } = props;
    if (selectedAccount.status !== 'loaded') {
        return <WalletLayout title="Coinmarket | exchange" account={selectedAccount} />;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const coinmarketExchangeContextValues = useCoinmarketExchangeForm({
        ...props,
        selectedAccount,
    });

    return (
        <CoinmarketLayout>
            <ExchangeFormContext.Provider value={coinmarketExchangeContextValues}>
                <ExchangeForm />
            </ExchangeFormContext.Provider>
        </CoinmarketLayout>
    );
};

export default connect(mapStateToProps)(CoinmarketExchange);
