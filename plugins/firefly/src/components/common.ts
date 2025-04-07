export const numberWithCommas = (x: string) => {
    const y = parseFloat(x).toFixed(2).split(".");
    const formattedInteger = y[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const formattedDecimal = +y[1] ? `.${y[1]}` : "";
    const output = `${formattedInteger}${formattedDecimal}`;
    return output;
};

export const capitalize = (x: string) => {
    return x.charAt(0).toUpperCase() + x.slice(1);
};