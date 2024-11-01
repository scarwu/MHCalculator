/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Store
import store from '@/scripts/states/store'

export const reset = (payload = {}) => {
    store.dispatch({
        type: 'RESET'
    })
}

export const setLocale = (payload = {}) => {
    store.dispatch({
        type: 'LOCALE',
        payload: payload
    })
}

export const setModalHub = (payload = {}) => {
    store.dispatch({
        type: 'MODAL_HUB',
        payload: payload
    })
}

export const setInitToggle = (payload = {}) => {
    store.dispatch({
        type: 'INIT_TOGGLE',
        payload: payload
    })
}
