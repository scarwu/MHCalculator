/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Store
import store from '@/scripts/states/store'

export const setInitToggle = (payload = {}) => {
    store.dispatch({
        type: 'INIT_TOGGLE',
        payload: payload
    })
}

export const setLocale = (payload = {}) => {
    store.dispatch({
        type: 'LOCALE',
        payload: payload
    })
}

export const setSeries = (payload = {}) => {
    store.dispatch({
        type: 'SERIES',
        payload: payload
    })
}

// Modal Hub
export const showModal = (target, data = null) => {
    store.dispatch({
        type: 'SHOW_MODAL',
        payload: {
            target: target,
            data: data
        }
    })
}

export const hideModal = (target) => {
    store.dispatch({
        type: 'HIDE_MODAL',
        payload: {
            target: target
        }
    })
}

export default {
    setInitToggle,
    setLocale,
    setSeries,

    showModal,
    hideModal
}
