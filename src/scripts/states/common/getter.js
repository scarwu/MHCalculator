/**
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load Store
import store from '@/scripts/states/store'

export const isInited = () => {
    return store.getState().common.initToggle
}

export const locale = () => {
    return store.getState().common.locale
}

export const series = () => {
    return store.getState().common.series
}

export const modalData = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().common.modalHub
    }

    if (Helper.isEmpty(store.getState().common.modalHub[target])) {
        return null
    }

    return store.getState().common.modalHub[target]
}
