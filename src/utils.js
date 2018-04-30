export function toFixed(v, p) {
    return parseFloat(v.toFixed(p))
}

export function toFixedMass(v) {
    return toFixed(v, 3)
}

export function toFixedMoney(v) {
    return toFixed(v, 2)
}
