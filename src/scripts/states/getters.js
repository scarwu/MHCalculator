/**
 * Common State - Getter
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

import store from './store'

export const isInited = () => {
    return store.getState().initToggle
}

export const lang = () => {
    return store.getState().lang
}

export const series = () => {
    return store.getState().series
}

export const modalData = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().modalHub
    }

    if (Helper.isEmpty(store.getState().modalHub[target])) {
        return null
    }

    return store.getState().modalHub[target]
}

export const dataStore = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().dataStore
    }

    if (Helper.isEmpty(store.getState().dataStore[target])) {
        return null
    }

    return store.getState().dataStore[target]
}

export const playerEquips = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().playerEquips
    }

    if (Helper.isEmpty(store.getState().playerEquips[target])) {
        return null
    }

    return store.getState().playerEquips[target]
}

export const playerStatus = () => {
    return store.getState().playerStatus
}

export const requiredConditions = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().requiredConditions
    }

    if (Helper.isEmpty(store.getState().requiredConditions[target])) {
        return null
    }

    return store.getState().requiredConditions[target]
}

export const algorithmParams = () => {
    return store.getState().algorithmParams
}

export const candidateBundles = () => {
    return store.getState().candidateBundles
}

export default {
    isInited,
    lang,
    series,
    modalData,

    dataStore,
    playerEquips,
    playerStatus,
    requiredConditions,
    algorithmParams,
    candidateBundles
}
