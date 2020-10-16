import React, { useEffect, useContext } from 'react';
import styled from 'styled-components';
import { LayoutContext, Translation } from '@suite-components';
import { Card, variables } from '@trezor/components';
import { CoinmarketExchangeOfferInfo, CoinmarketTopPanel } from '@wallet-components';
import { useCoinmarketExchangeDetailContext } from '@wallet-hooks/useCoinmarketExchangeDetail';
import { ExchangeTradeFinalStatuses } from '@wallet-hooks/useCoinmarket';

import PaymentFailed from '../components/PaymentFailed';
import PaymentSuccessful from '../components/PaymentSuccessful';
import PaymentKYC from '../components/PaymentKYC';
import PaymentConverting from '../components/PaymentConverting';
import PaymentSending from '../components/PaymentSending';

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

const NoTradeError = styled.div`
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const CoinmarketDetail = () => {
    const { setLayout } = useContext(LayoutContext);

    useEffect(() => {
        if (setLayout) setLayout('Trezor Suite | Coinmarket', undefined, <CoinmarketTopPanel />);
    }, [setLayout]);

    const { account, trade, exchangeInfo } = useCoinmarketExchangeDetailContext();
    const tradeStatus = trade?.data?.status;
    if (!tradeStatus) return null;

    const showSending =
        !ExchangeTradeFinalStatuses.includes(tradeStatus) && tradeStatus !== 'CONVERTING';

    const exchange = trade?.data?.exchange;
    const provider =
        exchangeInfo && exchangeInfo.providerInfos && exchange
            ? exchangeInfo.providerInfos[exchange]
            : undefined;
    const supportUrlTemplate = provider?.statusUrl || provider?.supportUrl;
    const supportUrl = supportUrlTemplate?.replace('{{orderId}}', trade?.data?.orderId || '');

    return (
        <Wrapper>
            {!trade && (
                <NoTradeError>
                    <Translation id="TR_COINMARKET_TRADE_NOT_FOUND" />
                </NoTradeError>
            )}
            {trade && (
                <>
                    <StyledCard>
                        {tradeStatus === 'SUCCESS' && <PaymentSuccessful account={account} />}
                        {tradeStatus === 'KYC' && (
                            <PaymentKYC
                                account={account}
                                provider={provider}
                                supportUrl={supportUrl}
                            />
                        )}
                        {tradeStatus === 'ERROR' && (
                            <PaymentFailed
                                account={account}
                                transactionId={trade.key}
                                supportUrl={supportUrl}
                            />
                        )}
                        {tradeStatus === 'CONVERTING' && (
                            <PaymentConverting supportUrl={supportUrl} />
                        )}
                        {showSending && <PaymentSending supportUrl={supportUrl} />}
                    </StyledCard>
                    <CoinmarketExchangeOfferInfo
                        account={account}
                        selectedQuote={trade.data}
                        transactionId={trade.key}
                    />
                </>
            )}
        </Wrapper>
    );
};

export default CoinmarketDetail;
