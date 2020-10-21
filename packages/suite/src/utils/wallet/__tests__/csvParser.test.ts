import { parseCSV } from '../csvParser';

const FIXTURES = [
    {
        description: 'csv without header',
        csv: `bcAddRe5,0.2,usd\r"bcAddRe5",0.1,"CZK"`,
        columns: ['address', 'amount', 'currency'],
        result: [
            { address: 'bcAddRe5', amount: '0.2', currency: 'usd' },
            { address: 'bcAddRe5', amount: '0.1', currency: 'CZK' },
        ],
    },
    {
        description: 'csv with header',
        csv: `address,amount,currency\nbcAddRe5,0.2,usd\r"bcAddRe5",0.1,"CZK"`,
        columns: ['address', 'amount', 'currency'],
        result: [
            { address: 'bcAddRe5', amount: '0.2', currency: 'usd' },
            { address: 'bcAddRe5', amount: '0.1', currency: 'CZK' },
        ],
    },
    {
        description: 'csv without specified columns',
        csv: `bcAddRe5,0.2,usd\r"bcAddRe5",0.1,"CZK"`,
        result: [
            { '0': 'bcAddRe5', '1': '0.2', '2': 'usd' },
            { '0': 'bcAddRe5', '1': '0.1', '2': 'CZK' },
        ],
    },
    {
        description: 'csv without specified delimiter',
        csv: `bcAddRe5`,
        result: [{ '0': 'bcAddRe5' }],
    },
    {
        description: 'csv with mixed delimiters',
        csv: `1,2;3|4\t5^6`,
        result: [{ '0': '1', '1': '2;3|4\t5^6' }],
    },
    {
        description: 'csv with defined delimiter',
        csv: `a#b#c`,
        delimiter: '#',
        result: [{ '0': 'a', '1': 'b', '2': 'c' }],
    },
];

describe('csvParser.parseCSV', () => {
    FIXTURES.forEach(f => {
        it(f.description, () => {
            expect(parseCSV(f.csv, f.columns, f.delimiter)).toEqual(f.result);
        });
    });
});
