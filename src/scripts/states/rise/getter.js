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

export const getModalData = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.modalHub
    }

    if (Helper.isEmpty(store.getState().rise.modalHub[target])) {
        return null
    }

    return store.getState().rise.modalHub[target]
}

export const getDataStore = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.dataStore
    }

    if (Helper.isEmpty(store.getState().rise.dataStore[target])) {
        return null
    }

    return store.getState().rise.dataStore[target]
}

export const getPlayerStatus = () => {
    return store.getState().rise.playerStatus
}

export const getPlayerEquips = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.playerEquips
    }

    if (Helper.isEmpty(store.getState().rise.playerEquips[target])) {
        return null
    }

    return store.getState().rise.playerEquips[target]
}

export const getRequiredConditions = (target = null) => {
    if (Helper.isEmpty(target)) {
        return store.getState().rise.requiredConditions
    }

    if (Helper.isEmpty(store.getState().rise.requiredConditions[target])) {
        return null
    }

    return store.getState().rise.requiredConditions[target]
}

export const getAlgorithmParams = () => {
    return store.getState().rise.algorithmParams
}

export const getCandidateBundles = () => {
    return store.getState().rise.candidateBundles
}

export default {
    getModalData,
    getDataStore,
    getPlayerStatus,
    getPlayerEquips,
    getRequiredConditions,
    getAlgorithmParams,
    getCandidateBundles
}
