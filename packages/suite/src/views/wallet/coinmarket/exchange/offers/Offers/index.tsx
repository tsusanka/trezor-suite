import React, { useMemo, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import invityAPI from '@suite-services/invityAPI';
import { LayoutContext, Translation } from '@suite-components';
import { CoinmarketTopPanel, CoinmarketFooter } from '@wallet-components';
import { variables, Icon, colors, CoinLogo } from '@trezor/components';
import { useCoinmarketExchangeOffersContext } from '@wallet-hooks/useCoinmarketExchangeOffers';

import List from './List';
import SelectedOffer from './SelectedOffer';
import { differenceInSeconds } from 'date-fns';

const Wrapper = styled.div`
    padding: 0 32px 32px 32px;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        padding: 16px;
    }
`;

const NoQuotes = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    min-height: 550px;
    align-items: center;
    flex: 1;
`;

const Header = styled.div`
    margin: 18px 0 24px 0;
`;

const SummaryRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: ${variables.FONT_SIZE.H2};
    text-transform: uppercase;
`;

const Text = styled.div`
    display: flex;
    padding-top: 3px;
    align-items: center;
`;

const StyledIcon = styled(Icon)`
    padding: 0 10px;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
`;

const Right = styled.div`
    display: flex;
    justify-self: flex-end;
    align-items: center;
    font-size: ${variables.FONT_SIZE.SMALL};
`;

const RefreshLabel = styled.div`
    color: ${colors.NEUE_TYPE_LIGHT_GREY};
    font-size: smaller;
`;

const RefreshTime = styled.div`
    min-width: 30px;
    text-align: right;
`;

const StyledCoinLogo = styled(CoinLogo)`
    padding-left: 10px;
`;

const InvityCoinLogo = styled.img`
    height: 18px;
    padding-right: 10px;
`;

const Offers = () => {
    const {
        fixedQuotes,
        floatQuotes,
        quotesRequest,
        selectedQuote,
        account,
        lastFetchDate,
        REFETCH_INTERVAL,
    } = useCoinmarketExchangeOffersContext();
    const { setLayout } = useContext(LayoutContext);
    const [seconds, setSeconds] = useState(differenceInSeconds(new Date(), lastFetchDate));

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = differenceInSeconds(new Date(), lastFetchDate);
            setSeconds(seconds);
        }, 50);
        return () => clearInterval(interval);
    });

    useMemo(() => {
        if (setLayout) setLayout('Trezor Suite | Coinmarket', undefined, <CoinmarketTopPanel />);
    }, [setLayout]);

    if (!quotesRequest) return null;
    const quotesCount = fixedQuotes?.length + floatQuotes?.length;

    return (
        <Wrapper>
            {!quotesCount && <NoQuotes>No quotes here</NoQuotes>}

            {!selectedQuote && quotesCount > 0 && (
                <>
                    <Header>
                        <SummaryRow>
                            <Left>
                                <Text>{`${quotesRequest.sendStringAmount} ${quotesRequest.send}`}</Text>
                                <StyledCoinLogo size={21} symbol={account.symbol} />
                                <StyledIcon icon="ARROW_RIGHT" />
                                <InvityCoinLogo
                                    src={`${
                                        invityAPI.server
                                    }/images/coins/${quotesRequest.receive.toUpperCase()}.svg`}
                                />
                                <Text>{quotesRequest.receive}</Text>
                            </Left>
                            <Right>
                                <RefreshLabel>
                                    <Translation id="TR_EXCHANGE_OFFERS_REFRESH" />
                                </RefreshLabel>
                                <RefreshTime>
                                    {Math.max(0, REFETCH_INTERVAL / 1000 - seconds)}s
                                </RefreshTime>
                            </Right>
                        </SummaryRow>
                    </Header>

                    {fixedQuotes?.length && <List quotes={fixedQuotes} isFixed />}
                    {floatQuotes?.length && <List quotes={floatQuotes} />}
                </>
            )}
            {selectedQuote && <SelectedOffer />}
            <CoinmarketFooter />
        </Wrapper>
    );
};

export default Offers;
