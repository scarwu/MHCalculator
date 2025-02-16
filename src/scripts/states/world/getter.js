/**
 * Common State - Getter
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load Store
import store from '@/scripts/states/store'

export const dataStore = () => {
    return store.getState().world.dataStore
}

export const requiredSets = () => {
    return store.getState().world.requiredSets
}

export const requiredSkills = () => {
    return store.getState().world.requiredSkills
}

export const requiredEquips = () => {
    return store.getState().world.requiredEquips
}

export const currentEquips = () => {
    return store.getState().world.currentEquips
}

export const algorithmParams = () => {
    return store.getState().world.algorithmParams
}

export const computedResult = () => {
    return store.getState().world.computedResult
}

export const reservedBundles = () => {
    return store.getState().world.reservedBundles
}

export const customWeapon = () => {
    return store.getState().world.customWeapon
}

export default {
    dataStore,
    requiredSets,
    requiredSkills,
    requiredEquips,
    currentEquips,
    algorithmParams,
    computedResult,
    reservedBundles,
    customWeapon
}
