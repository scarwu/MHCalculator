/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Initial State
const initialState = {
    locale: null,
    modalHub: {},
    initToggle: false
}

export default (state = initialState, action) => {
    let type = action.type
    let payload = action.payload

    switch (type) {
    case 'LOCALE':
        return (() => {
            return Object.assign({}, state, {
                locale: payload
            })
        })()
    case 'MODAL_HUB':
        return (() => {
            state.modalHub[payload.target] = payload.data

            return Object.assign({}, state, {
                modalHub: Object.assign({}, state.modalHub)
            })
        })()
    case 'INIT_TOGGLE':
        return (() => {
            return Object.assign({}, state, {
                initToggle: !!payload
            })
        })()
    default:
        return state
    }
}
