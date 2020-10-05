import React from 'react';
import ReactSelect, { components, Props as SelectProps } from 'react-select';
import styled from 'styled-components';
import { colors, variables } from '../../../config';
import { InputVariant } from '../../../support/types';

const selectStyle = (
    isSearchable: boolean,
    withDropdownIndicator = true,
    variant: InputVariant,
    usePointerCursor: boolean,
    hideTextCursor: boolean,
    fontFamily: string
) => ({
    singleValue: (base: Record<string, any>) => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        color: colors.BLACK0,
        fontSize: variables.NEUE_FONT_SIZE.NORMAL,
        // explicitly define font-family because elements in <ReactSelect/> can inherit some other fonts unexpectedly
        fontFamily: `${fontFamily} !important`,
        '&:hover': {
            cursor: usePointerCursor || !isSearchable ? 'pointer' : 'text',
        },
    }),
    control: (
        base: Record<string, any>,
        { isDisabled, isFocused }: { isDisabled: boolean; isFocused: boolean }
    ) => {
        return {
            ...base,
            minHeight: 'initial',
            display: 'flex',
            alignItems: 'center',
            fontSize: variables.FONT_SIZE.SMALL,
            height: variant === 'small' ? '36px' : '48px',
            borderRadius: '4px',
            borderWidth: '2px',
            borderColor: colors.NEUE_STROKE_GREY,
            boxShadow: 'none',
            '&:hover, &:focus': {
                cursor: 'pointer',
                borderRadius: '4px',
                borderWidth: '2px',
                borderColor: colors.NEUE_STROKE_GREY,
            },
        };
    },
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: (base: Record<string, any>, { isDisabled }: { isDisabled: boolean }) => ({
        ...base,
        display: !withDropdownIndicator || isDisabled ? 'none' : 'flex',
        alignItems: 'center',
        color: colors.NEUE_TYPE_LIGHT_GREY,
        path: '',
        '&:hover': {
            color: colors.BLACK0,
        },
    }),
    menu: (base: Record<string, any>) => ({
        ...base,
        margin: '5px 0',
        boxShadow: 'box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.15)',
        zIndex: 9,
    }),
    menuList: (base: Record<string, any>) => ({
        ...base,
        padding: 0,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        background: colors.WHITE,
        // border: `1px solid ${colors.BLACK80}`,
        borderRadius: '4px',
    }),
    option: (base: Record<string, any>, { isFocused }: { isFocused: boolean }) => ({
        ...base,
        color: colors.NEUE_TYPE_DARK_GREY,
        background: isFocused ? colors.NEUE_BG_GRAY : colors.WHITE,
        borderRadius: 0,
        fontSize: variables.NEUE_FONT_SIZE.NORMAL,
        fontFamily: `${fontFamily} !important`,
        '&:hover': {
            cursor: 'pointer',
        },
    }),
    input: (base: Record<string, any>) => ({
        ...base,
        fontSize: variables.NEUE_FONT_SIZE.NORMAL,
        color: hideTextCursor ? 'transparent' : colors.BLACK0,
        '& input': {
            fontFamily: `${fontFamily} !important`,
            textShadow: hideTextCursor ? `0 0 0 ${colors.BLACK0} !important` : 'none',
        },
    }),
});

const Wrapper = styled.div<Props>`
    width: ${props => (props.width ? `${props.width}px` : '100%')};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

const Label = styled.span`
    min-height: 32px;
`;

interface Props extends Omit<SelectProps, 'components'> {
    withDropdownIndicator?: boolean;
    label?: React.ReactNode;
    wrapperProps?: Record<string, any>;
    variant?: InputVariant;
    noTopLabel?: boolean;
    usePointerCursor?: boolean;
    hideTextCursor?: boolean; // this prop hides blinking text cursor
    fontFamily?: string;
}

const Select = ({
    isSearchable = true,
    usePointerCursor = false,
    hideTextCursor = false,
    withDropdownIndicator = true,
    className,
    wrapperProps,
    label,
    width,
    variant = 'large',
    noTopLabel = false,
    fontFamily = variables.FONT_FAMILY.TTHOVES,
    ...props
}: Props) => {
    // customize control to pass data-test attribute
    const Control = (controlProps: any) => {
        return (
            <components.Control
                {...controlProps}
                innerProps={{
                    ...controlProps.innerProps,
                    'data-test': `${props['data-test']}/input`,
                }}
            />
        );
    };

    // customize options to pass data-test attribute
    const Option = (optionProps: any) => {
        return (
            <components.Option
                {...optionProps}
                innerProps={{
                    ...optionProps.innerProps,
                    'data-test': `${props['data-test']}/option/${optionProps.value}`,
                }}
            />
        );
    };

    return (
        <Wrapper className={className} width={width} {...wrapperProps}>
            {!noTopLabel && <Label>{label}</Label>}
            <ReactSelect
                styles={selectStyle(
                    isSearchable,
                    withDropdownIndicator,
                    variant,
                    usePointerCursor,
                    hideTextCursor,
                    fontFamily
                )}
                isSearchable={isSearchable}
                {...props}
                components={{ Control, Option, ...props.components }}
            />
        </Wrapper>
    );
};

export { Select, Props as SelectProps };
