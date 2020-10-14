import React from 'react';
import { connect } from 'react-redux';
import { AppState } from '@suite-types';
import { WalletLayout } from '@wallet-components';
import styled from 'styled-components';
import { ComponentProps, Props } from '@wallet-types/coinmarketExchangeOffers';
import {
    CoinmarketExchangeOffersContext,
    useOffers,
} from '@wallet-hooks/useCoinmarketExchangeOffers';
import Offers from './Offers';

const mapStateToProps = (state: AppState): ComponentProps => ({
    selectedAccount: state.wallet.selectedAccount,
    device: state.suite.device,
    fixedQuotes: state.wallet.coinmarket.exchange.fixedQuotes,
    floatQuotes: state.wallet.coinmarket.exchange.floatQuotes,
    quotesRequest: state.wallet.coinmarket.exchange.quotesRequest,
    addressVerified: state.wallet.coinmarket.exchange.addressVerified,
    exchangeInfo: state.wallet.coinmarket.exchange.exchangeInfo,
});

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
`;

const OffersIndexLoaded = (props: Props) => {
    const { selectedAccount } = props;
    const coinmarketOffersValues = useOffers({ ...props, selectedAccount });

    return (
        <CoinmarketExchangeOffersContext.Provider value={coinmarketOffersValues}>
            <Wrapper>
                <Offers />
            </Wrapper>
        </CoinmarketExchangeOffersContext.Provider>
    );
};

const OffersIndex = (props: ComponentProps) => {
    const { selectedAccount } = props;
    if (selectedAccount.status !== 'loaded') {
        return <WalletLayout title="Coinmarket | exchange" account={selectedAccount} />;
    }
    return <OffersIndexLoaded {...props} selectedAccount={selectedAccount} />;
};

export default connect(mapStateToProps)(OffersIndex);
