export function toFixed(v, p) {
    return parseFloat(v.toFixed(p))
}

export function toFixedMass(v) {
    return toFixed(v, 3)
}

export function toFixedMoney(v) {
    return toFixed(v, 2)
}

export function getTodayDateTimeString() {
    return toDateTimeString(new Date())
}

export function getTodayString() {
    return toDateString(new Date())
}

/**
 * return date string, format: yyyy-MM-dd
 * @param {string|Date} d 
 */
export function toDateString(date) {
    if (date instanceof Date) {
        let m = date.getMonth() + 1;
        if (m < 10)
            m = '0' + m;
        let d = date.getDate();
        if (d < 10)
            d = '0' + d;
    
        return `${date.getFullYear()}-${m}-${d}`
    } else if (typeof(date)  === 'string') {
        return date.split(/[T ]/)[0]
    }

    return date
}

/**
 * return date string, format: yyyy-MM-dd
 * @param {string|Date} d 
 */
export function toMonthString(date) {
    if (date instanceof Date) {
        let m = date.getMonth() + 1;
        if (m < 10)
            m = '0' + m;
    
        return `${date.getFullYear()}-${m}`
    } else if (typeof(date)  === 'string') {
        // let ds = date.split(/-/)
        // return ds[0] + "-" + ds[1]
        return toMonthString(new Date(date))
    }

    return date
}

/**
 * return date string, format: yyyy-MM-dd
 * @param {Date} d 
 */
export function toDateTimeString(date) {
    if (date instanceof Date) {
        let h = date.getHours();
        if (h < 10)
            h = '0' + h;
        let m = date.getMinutes();
        if (m < 10)
            m = '0' + m;
        let s = date.getSeconds();
        if (s < 10)
            s = '0' + s;
        return `${toDateString(date)} ${h}:${m}:${s}`
    } else 
        return null
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