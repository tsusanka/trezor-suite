const CELL_DELIMITERS = [',', ';', '\t', '|', '^'];
// const LINE_DELIMITERS = ['\r\n', '\r', '\n'];

type Result = { [key: string]: string };

// delimiter detection cherry-picked from 'comma-separated-values' package
// https://github.com/knrz/CSV.js
const frequency = (text: string, needle: string, limit: number) => {
    let count = 0;
    let lastIndex = 0;

    while (lastIndex < limit) {
        lastIndex = text.indexOf(needle, lastIndex);
        if (lastIndex === -1) break;
        count++;
    }

    return count;
};

const detectDelimiter = (text: string, needles: string[]) => {
    const limit = Math.min(48, Math.floor(text.length / 20), text.length);
    let detected: string | undefined;

    for (let cur = needles.length - 1; cur >= 0; cur--) {
        if (frequency(text, needles[cur], limit) > 0) {
            detected = needles[cur];
        }
    }

    return detected || needles[0];
};

const parseLine = (line: string, delimiter: string, columns: string[]) => {
    const cells = line.split(delimiter);
    const output: Result = {};
    cells.forEach((value, index) => {
        const key = columns[index];
        // strip double quotes and whitespace
        const cleanValue = value.replace(/^"|"$/g, '').trim();
        if (typeof key === 'string') {
            // skip csv header (value is one of column keys)
            if (!columns.includes(cleanValue.toLowerCase())) {
                output[key] = cleanValue;
            }
        } else {
            // use index as a key
            output[index] = cleanValue;
        }
    });
    return output;
};

export const parseCSV = (text: string, columns: string[] = [], delimiter?: string) => {
    // detect delimiter
    const d = delimiter || detectDelimiter(text, CELL_DELIMITERS);
    // normalize new line delimiter and split into lines
    const lines = text.replace('\r', '\n').replace('\n\n', '\n').split('\n');

    const result: Result[] = [];
    lines.forEach(line => {
        const output = parseLine(line, d, columns);
        if (Object.keys(output).length) {
            // use only valid lines
            result.push(output);
        }
    });
    return result;
};
