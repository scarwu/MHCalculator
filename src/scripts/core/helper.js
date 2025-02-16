/**
 * Helper
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Libraries
import md5 from 'md5'

// Load Config
import Config from '@/scripts/config'

export const log = (...params) => {
    if ('production' !== Config.env) {
        console.log.apply(this, params)
    }
}

export const debug = (...params) => {
    if ('production' !== Config.env) {
        console.debug.apply(this, params)
    }
}

export const isEmpty = (variable) => {
    return (undefined === variable || null === variable)
}

export const isNotEmpty = (variable) => {
    return (undefined !== variable && null !== variable)
}

export const deepCopy = (data) => {
    return JSON.parse(JSON.stringify(data))
}

export const jsonHash = (data) => {
    return md5(JSON.stringify(data))
}

export const base64Encode = (text) => {
    text = window.btoa(text)

    return text
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

export const base64Decode = (text) => {
    text = text
        .replace(/\-/g, '+')
        .replace(/\_/g, '/')

    return window.atob(text)
}

export const ucfirst = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export const convertTimeFormat = (seconds) => {
    let text = ''

    if (seconds > 3600) {
        let hours = parseInt(seconds / 3600)

        seconds -= hours * 3600
        text += hours + ' ' + _('hour') + ' '
    }

    if (seconds > 60) {
        let minutes = parseInt(seconds / 60)

        seconds -= minutes * 60
        text += minutes + ' ' + _('minute') + ' '
    }

    text += seconds + ' ' + _('second')

    return text
}

export default {
    log,
    debug,
    isEmpty,
    isNotEmpty,
    deepCopy,
    jsonHash,
    base64Encode,
    base64Decode,
    ucfirst,
    convertTimeFormat
}
