import React from 'react';
import styled from 'styled-components';
import { Card, variables } from '@trezor/components';
import { useCoinmarketExchangeOffersContext } from '@wallet-hooks/useCoinmarketExchangeOffers';
import CoinmarketExchangeOfferInfo from '@wallet-components/CoinmarketExchangeOfferInfo';
import VerifyAddress from './components/VerifyAddress';

const Wrapper = styled.div`
    display: flex;
    margin-top: 20px;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        flex-direction: column;
    }
`;

const StyledCard = styled(Card)`
    flex: 1;
    padding: 0;
`;

const SelectedOffer = () => {
    const {
        account,
        selectedQuote,
        exchangeInfo,
        exchangeStep,
    } = useCoinmarketExchangeOffersContext();
    if (!selectedQuote) return null;

    return (
        <Wrapper>
            <StyledCard>
                {exchangeStep === 'RECEIVING_ADDRESS' ? <VerifyAddress /> : null}
            </StyledCard>
            <CoinmarketExchangeOfferInfo
                selectedQuote={selectedQuote}
                account={account}
                exchangeInfo={exchangeInfo}
            />
        </Wrapper>
    );
};

export default SelectedOffer;
