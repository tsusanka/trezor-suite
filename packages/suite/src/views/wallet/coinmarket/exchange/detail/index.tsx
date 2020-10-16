import React from 'react';
import { AppState } from '@suite-types';
import {
    useCoinmarketExchangeDetail,
    CoinmarketExchangeDetailContext,
} from '@wallet-hooks/useCoinmarketExchangeDetail';
import { WalletLayout } from '@wallet-components';
import styled from 'styled-components';
import { ComponentProps, Props } from '@wallet-types/coinmarketExchangeDetail';
import { connect } from 'react-redux';

import Detail from './Detail';

const mapStateToProps = (state: AppState): ComponentProps => ({
    selectedAccount: state.wallet.selectedAccount,
    trades: state.wallet.coinmarket.trades,
    transactionId: state.wallet.coinmarket.exchange.transactionId,
});

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
`;

const DetailIndexLoaded = (props: Props) => {
    const { selectedAccount } = props;
    const coinmarketExchangeContextValues = useCoinmarketExchangeDetail({
        ...props,
        selectedAccount,
    });

    return (
        <CoinmarketExchangeDetailContext.Provider value={coinmarketExchangeContextValues}>
            <Wrapper>
                <Detail />
            </Wrapper>
        </CoinmarketExchangeDetailContext.Provider>
    );
};

const DetailIndex = (props: ComponentProps) => {
    const { selectedAccount } = props;

    if (selectedAccount.status !== 'loaded') {
        return <WalletLayout title="Coinmarket | exchange" account={selectedAccount} />;
    }
    return <DetailIndexLoaded {...props} selectedAccount={selectedAccount} />;
};

export default connect(mapStateToProps)(DetailIndex);
