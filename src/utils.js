export function toFixed(v, p) {
    return parseFloat(v.toFixed(p))
}

export function toFixedMass(v) {
    return toFixed(v, 3)
}

export function toFixedMoney(v) {
    return toFixed(v, 2)
}

export function getTodayString() {
    const now = new Date();
    let m = now.getMonth() + 1;
    if (m < 10)
        m = '0' + m;
    let d = now.getDate();
    if (d < 10)
        d = '0' + d;

    return `${now.getFullYear()}-${m}-${d}`
}

// export function getTodayString() {
//     const now = new Date();
//     let m = now.getMonth() + 1;
//     if (m < 10)
//         m = '0' + m;
//     let d = now.getDate();
//     if (d < 10)
//         d = '0' + d;

//     return `${now.getFullYear()}-${m}-${d}`
// }