import React from 'react';
import styled from 'styled-components';
import { Card, variables } from '@trezor/components';
import { useCoinmarketExchangeOffersContext } from '@suite/hooks/wallet/useCoinmarketExchangeOffers';
import CoinmarketExchangeOfferInfo from '@suite/components/wallet/CoinmarketExchangeOfferInfo';

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
    const { account, selectedQuote, exchangeInfo } = useCoinmarketExchangeOffersContext();
    if (!selectedQuote) return null;

    return (
        <Wrapper>
            <StyledCard>
                Selected offer here {/* <VerifyAddress selectedQuote={selectedQuote} /> */}
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
