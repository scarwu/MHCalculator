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

export const getTempData = () => {
    return store.getState().world.tempData
}

export const getRequiredSets = () => {
    return store.getState().world.requiredSets
}

export const getRequiredSkills = () => {
    return store.getState().world.requiredSkills
}

export const getRequiredEquips = () => {
    return store.getState().world.requiredEquips
}

export const getCurrentEquips = () => {
    return store.getState().world.currentEquips
}

export const getAlgorithmParams = () => {
    return store.getState().world.algorithmParams
}

export const getComputedResult = () => {
    return store.getState().world.computedResult
}

export const getReservedBundles = () => {
    return store.getState().world.reservedBundles
}

export const getCustomWeapon = () => {
    return store.getState().world.customWeapon
}

export const isShowChangelog = () => {
    return store.getState().world.changelog.isShow
}

export const isShowAlgorithmSetting = () => {
    return store.getState().world.algorithmSetting.isShow
}

export const getAlgorithmSettingBypassData = () => {
    return store.getState().world.algorithmSetting.bypassData
}

export const isShowBundleItemSelector = () => {
    return store.getState().world.bundleItemSelector.isShow
}

export const isShowConditionItemSelector = () => {
    return store.getState().world.conditionItemSelector.isShow
}

export const getConditionItemSelectorBypassData = () => {
    return store.getState().world.conditionItemSelector.bypassData
}

export const isShowEquipItemSelector = () => {
    return store.getState().world.equipItemSelector.isShow
}

export const getEquipItemSelectorBypassData = () => {
    return store.getState().world.equipItemSelector.bypassData
}

export default {
    getTempData,
    getRequiredSets,
    getRequiredSkills,
    getRequiredEquips,
    getCurrentEquips,
    getAlgorithmParams,
    getComputedResult,
    getReservedBundles,
    getCustomWeapon,
    isShowChangelog,
    isShowAlgorithmSetting,
    getAlgorithmSettingBypassData,
    isShowBundleItemSelector,
    isShowConditionItemSelector,
    getConditionItemSelectorBypassData,
    isShowEquipItemSelector,
    getEquipItemSelectorBypassData
}
