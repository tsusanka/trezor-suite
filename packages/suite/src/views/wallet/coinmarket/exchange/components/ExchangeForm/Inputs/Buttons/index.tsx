import { colors, variables } from '@trezor/components';
import React from 'react';
import styled from 'styled-components';
import { findToken } from '@wallet-utils/sendFormUtils';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';

const Wrapper = styled.div`
    display: flex;
    justify-content: space-between;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        margin-top: 27px;
    }
`;

const TokenBalance = styled.div`
    padding: 0px 6px;
    font-size: ${variables.NEUE_FONT_SIZE.TINY};
    color: ${colors.NEUE_TYPE_LIGHT_GREY};
`;

const TokenBalanceValue = styled.span`
    font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
`;

const Left = styled.div`
    display: flex;
`;

const Button = styled.div`
    padding: 4px 6px;
    margin-right: 10px;
    cursor: pointer;
    border-radius: 4px;
    background-color: ${colors.NEUE_BG_GRAY};
    color: ${colors.NEUE_TYPE_DARK_GREY};
    font-size: ${variables.FONT_SIZE.TINY};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

const Bottom = () => {
    const { compose, setActiveMaxLimit, token, account } = useCoinmarketExchangeFormContext();
    const tokenData = findToken(account.tokens, token);

    return (
        <Wrapper>
            <Left>
                <Button
                    onClick={() => {
                        setActiveMaxLimit(1);
                        compose({ activeMaxLimit: 1 });
                    }}
                >
                    All
                </Button>
                <Button
                    onClick={async () => {
                        setActiveMaxLimit(2);
                        compose({ activeMaxLimit: 2 });
                    }}
                >
                    1/2
                </Button>
                <Button
                    onClick={async () => {
                        setActiveMaxLimit(4);
                        compose({ activeMaxLimit: 4 });
                    }}
                >
                    1/4
                </Button>
            </Left>
            <TokenBalance>
                {tokenData && (
                    <TokenBalanceValue>{`${
                        tokenData.balance
                    } ${tokenData.symbol!.toUpperCase()}`}</TokenBalanceValue>
                )}
            </TokenBalance>
        </Wrapper>
    );
};

export default Bottom;
