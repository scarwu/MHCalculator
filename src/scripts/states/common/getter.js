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

export const locale = () => {
    return store.getState().common.locale
}

export const modalData = (targetKey) => {
    return Helper.isNotEmpty(store.getState().common.modalHub[targetKey])
        ? store.getState().common.modalHub[targetKey] : null
}

export const isInited = () => {
    return store.getState().common.initToggle
}
