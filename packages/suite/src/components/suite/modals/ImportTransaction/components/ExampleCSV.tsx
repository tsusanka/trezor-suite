import React from 'react';
import styled from 'styled-components';
import { P } from '@trezor/components';
import { Translation } from '@suite-components';
import { useSelector } from '@suite-hooks';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    padding-bottom: 16px;
`;

export const ExampleCSV = () => {
    const { account } = useSelector(state => state.wallet.selectedAccount);
    if (!account) return null;

    // for BTC get first two unused addresses
    // for ETH and XRP descriptor get twice (used in two examples)
    const addresses = account.addresses?.unused.slice(0, 2).map(a => a.address) || [
        account.descriptor,
        account.descriptor,
    ];
    return (
        <Wrapper>
            <P>
                <Translation id="TR_IMPORT_CSV_MODAL_EXAMPLE" />
            </P>
            {/* CSV keys shouldn't be translated */}
            <P size="small">address,amount,currency</P>
            <P size="small">
                {addresses[0]},0.31337,{account.symbol.toUpperCase()}
            </P>
            <P size="small">{addresses[1]},0.1,USD</P>
        </Wrapper>
    );
};
