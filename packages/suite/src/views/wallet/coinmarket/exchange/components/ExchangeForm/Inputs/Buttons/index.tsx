import { colors, variables } from '@trezor/components';
import React from 'react';
import styled from 'styled-components';
import { useCoinmarketExchangeFormContext } from '@suite/hooks/wallet/useCoinmarketExchangeForm';

const Wrapper = styled.div`
    display: flex;

    @media screen and (max-width: ${variables.SCREEN_SIZE.LG}) {
        margin-top: 27px;
    }
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
    const { compose, setActiveMaxLimit } = useCoinmarketExchangeFormContext();

    return (
        <Wrapper>
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
        </Wrapper>
    );
};

export default Bottom;
