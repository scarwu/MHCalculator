/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

const statusMapping = {
    locale:     'state:locale',
    series:     'state:series',
    modalHub:   'state:modalHub'
}

// Initial State
const initialState = {
    initToggle: false,
    locale: Status.get(statusMapping.locale) || null,
    series: Status.get(statusMapping.series) || null,
    modalHub: Status.get(statusMapping.modalHub) || {}
}

export default (state = initialState, action) => {
    let type = action.type
    let payload = action.payload

    switch (type) {
    case 'INIT_TOGGLE':
        return (() => {
            return Object.assign({}, state, {
                initToggle: !!payload
            })
        })()

    case 'LOCALE':
        return (() => {
            return Object.assign({}, state, {
                locale: payload
            })
        })()

    case 'SERIES':
        return (() => {
            return Object.assign({}, state, {
                series: payload
            })
        })()

    // Modal Hub
    case 'SHOW_MODAL':
        return (() => {
            let modalHub = Helper.deepCopy(state.modalHub)
            let target = payload.target
            let data = payload.data

            modalHub[target] = Helper.isNotEmpty(data) ? data : {}

            return Object.assign({}, state, {
                modalHub: modalHub
            })
        })()
    case 'HIDE_MODAL':
        return (() => {
            let modalHub = Helper.deepCopy(state.modalHub)
            let target = payload.target

            modalHub[target] = null

            return Object.assign({}, state, {
                modalHub: modalHub
            })
        })()
    default:
        return state
    }
}
