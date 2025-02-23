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

// Load Store
import store from '@/scripts/states/store'

export const dataStore = () => {
    return store.getState().world.dataStore
}

export const playerEquips = () => {
    return store.getState().world.playerEquips
}

export const playerStatus = () => {
    return store.getState().world.playerStatus
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
    return store.getState().world.algorithmParams
}

export const candidateBundles = () => {
    return store.getState().world.candidateBundles
}

export default {
    dataStore,
    playerStatus,
    playerEquips,
    requiredConditions,
    algorithmParams,
    candidateBundles
}
