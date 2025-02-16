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

export const dataStore = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.dataStore
    }

    if (Helper.isEmpty(store.getState().rise.dataStore[target])) {
        return null
    }

    return store.getState().rise.dataStore[target]
}

export const playerEquips = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.playerEquips
    }

    if (Helper.isEmpty(store.getState().rise.playerEquips[target])) {
        return null
    }

    return store.getState().rise.playerEquips[target]
}

export const playerStatus = () => {
    return store.getState().rise.playerStatus
}

export const requiredConditions = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.requiredConditions
    }

    if (Helper.isEmpty(store.getState().rise.requiredConditions[target])) {
        return null
    }

    return store.getState().rise.requiredConditions[target]
}

export const algorithmParams = () => {
    return store.getState().rise.algorithmParams
}

export const candidateBundles = () => {
    return store.getState().rise.candidateBundles
}

export default {
    dataStore,
    playerEquips,
    playerStatus,
    requiredConditions,
    algorithmParams,
    candidateBundles
}
