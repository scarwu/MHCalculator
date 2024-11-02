/**
 * Common State - Getter
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

import Store from './store'

export const getTempData = () => {
    return Store.getState().world.tempData
}

export const getRequiredSets = () => {
    return Store.getState().world.requiredSets
}

export const getRequiredSkills = () => {
    return Store.getState().world.requiredSkills
}

export const getRequiredEquips = () => {
    return Store.getState().world.requiredEquips
}

export const getCurrentEquips = () => {
    return Store.getState().world.currentEquips
}

export const getAlgorithmParams = () => {
    return Store.getState().world.algorithmParams
}

export const getComputedResult = () => {
    return Store.getState().world.computedResult
}

export const getReservedBundles = () => {
    return Store.getState().world.reservedBundles
}

export const getCustomWeapon = () => {
    return Store.getState().world.customWeapon
}

export const isShowChangelog = () => {
    return Store.getState().world.changelog.isShow
}

export const isShowAlgorithmSetting = () => {
    return Store.getState().world.algorithmSetting.isShow
}

export const getAlgorithmSettingBypassData = () => {
    return Store.getState().world.algorithmSetting.bypassData
}

export const isShowBundleItemSelector = () => {
    return Store.getState().world.bundleItemSelector.isShow
}

export const isShowConditionItemSelector = () => {
    return Store.getState().world.conditionItemSelector.isShow
}

export const getConditionItemSelectorBypassData = () => {
    return Store.getState().world.conditionItemSelector.bypassData
}

export const isShowEquipItemSelector = () => {
    return Store.getState().world.equipItemSelector.isShow
}

export const getEquipItemSelectorBypassData = () => {
    return Store.getState().world.equipItemSelector.bypassData
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
