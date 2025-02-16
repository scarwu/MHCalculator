/**
 * Common
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import Helper from '@/scripts/core/helper'

// Load Constant
import Constant from '@/scripts/constant'

// Load Datasets
import WeaponDataset from '@/scripts/libraries/world/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'
import DecorationDataset from '@/scripts/libraries/world/dataset/decoration'
import EnhanceDataset from '@/scripts/libraries/world/dataset/enhance'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

let getAppliedWeaponInfo = (extend) => {
    if ('object' !== typeof extend
        || 'string' !== typeof extend.id
    ) {
        return null
    }

    let info = WeaponDataset.getInfo(extend.id)

    if (Helper.isEmpty(info)) {
        return null
    }

    if (Helper.isNotEmpty(info.element)
        && Helper.isNotEmpty(info.element.attack)
    ) {
        info.element.attack.value = info.element.attack.minValue
    }

    if (Helper.isNotEmpty(info.element)
        && Helper.isNotEmpty(info.element.status)
    ) {
        info.element.status.value = info.element.status.minValue
    }

    // Handle Enhance
    let enhanceSize = 0

    if (6 <= info.rare && info.rare <= 8) {
        enhanceSize = 9 - info.rare
    }

    if (10 <= info.rare && info.rare <= 12) {
        enhanceSize = (15 - info.rare) * 2
    }

    info.enhanceSize = enhanceSize
    info.enhances = Helper.isNotEmpty(extend.enhances)
        ? extend.enhances : []

    info.enhances.forEach((enhance) => {
        let enhanceLevel = enhance.level
        let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

        if (Helper.isEmpty(enhanceInfo.list[enhanceLevel - 1].reaction)) {
            return false
        }

        Object.keys(enhanceInfo.list[enhanceLevel - 1].reaction).forEach((reactionType) => {
            let data = enhanceInfo.list[enhanceLevel - 1].reaction[reactionType]

            switch (reactionType) {
            case 'attack':
                info.attack += data.value * Constant.world.weaponMultiple[info.type]
                info.attack = parseInt(Math.round(info.attack))

                break
            case 'criticalRate':
                info.criticalRate += data.value

                break
            case 'defense':
                info.defense = data.value

                break
            case 'addSlot':
                info.slots.push({
                    size: data.size
                })

                break
            }
        })
    })

    // Handler Slot
    let skillLevelMapping = {}

    info.skills && info.skills.forEach((data, index) => {
        let skillId = data.id

        if (Helper.isEmpty(skillLevelMapping[skillId])) {
            skillLevelMapping[skillId] = 0
        }

        skillLevelMapping[skillId] += data.level
    })

    info.slots && info.slots.forEach((data, index) => {
        let decorationInfo = null

        if (Helper.isNotEmpty(extend.slotIds)
            && Helper.isNotEmpty(extend.slotIds[index])
        ) {
            decorationInfo = DecorationDataset.getInfo(extend.slotIds[index])
        }

        if (Helper.isEmpty(decorationInfo)) {
            info.slots[index].decoration = {}

            return false
        }

        // Update Info
        info.slots[index].decoration = {
            id: decorationInfo.id,
            size: decorationInfo.size
        }

        decorationInfo.skills && decorationInfo.skills.forEach((data, index) => {
            let skillId = data.id

            if (Helper.isEmpty(skillLevelMapping[skillId])) {
                skillLevelMapping[skillId] = 0
            }

            skillLevelMapping[skillId] += data.level
        })
    })

    // Reset Skill
    info.skills = []

    Object.keys(skillLevelMapping).forEach((skillId) => {
        let skillLevel = skillLevelMapping[skillId]
        let skillInfo = SkillDataset.getInfo(skillId)

        // Fix Skill Level Overflow
        if (skillLevel > skillInfo.list.length) {
            skillLevel = skillInfo.list.length
        }

        info.skills.push({
            id: skillId,
            level: skillLevel,
            description: skillInfo.list[skillLevel - 1].description
        })
    })

    info.skills = info.skills.sort((skillA, skillB) => {
        return skillB.level - skillA.level
    })

    return Helper.deepCopy(info)
}

let getAppliedArmorInfo = (extend) => {
    if ('object' !== typeof extend
        || 'string' !== typeof extend.id
    ) {
        return null
    }

    let info = ArmorDataset.getInfo(extend.id)

    if (Helper.isEmpty(info)) {
        return null
    }

    // Handler Skill & Slot
    let skillLevelMapping = {}

    info.skills && info.skills.forEach((data, index) => {
        let skillId = data.id

        if (Helper.isEmpty(skillLevelMapping[skillId])) {
            skillLevelMapping[skillId] = 0
        }

        skillLevelMapping[skillId] += data.level
    })

    info.slots && info.slots.forEach((data, index) => {
        let decorationInfo = null

        if (Helper.isNotEmpty(extend.slotIds)
            && Helper.isNotEmpty(extend.slotIds[index])
        ) {
            decorationInfo = DecorationDataset.getInfo(extend.slotIds[index])
        }

        if (Helper.isEmpty(decorationInfo)) {
            info.slots[index].decoration = {}

            return false
        }

        // Update Info
        info.slots[index].decoration = {
            id: decorationInfo.id,
            size: decorationInfo.size
        }

        decorationInfo.skills && decorationInfo.skills.forEach((data, index) => {
            let skillId = data.id

            if (Helper.isEmpty(skillLevelMapping[skillId])) {
                skillLevelMapping[skillId] = 0
            }

            skillLevelMapping[skillId] += data.level
        })
    })

    // Reset Skill
    info.skills = []

    Object.keys(skillLevelMapping).forEach((skillId) => {
        let skillLevel = skillLevelMapping[skillId]
        let skillInfo = SkillDataset.getInfo(skillId)

        info.skills.push({
            id: skillId,
            level: skillLevel,
            description: skillInfo.list[skillLevel - 1].description
        })
    })

    info.skills = info.skills.sort((skillA, skillB) => {
        return skillB.level - skillA.level
    })

    return Helper.deepCopy(info)
}

let getAppliedCharmInfo = (extend) => {
    if ('object' !== typeof extend
        || 'string' !== typeof extend.id
    ) {
        return null
    }

    let info = CharmDataset.getInfo(extend.id)

    if (Helper.isEmpty(info)) {
        return null
    }

    // Handler Skill & Slot
    let skillLevelMapping = {}

    info.skills && info.skills.forEach((data, index) => {
        let skillId = data.id

        if (Helper.isEmpty(skillLevelMapping[skillId])) {
            skillLevelMapping[skillId] = 0
        }

        skillLevelMapping[skillId] += data.level
    })

    // Reset Skill
    info.skills = []

    Object.keys(skillLevelMapping).forEach((skillId) => {
        let skillLevel = skillLevelMapping[skillId]
        let skillInfo = SkillDataset.getInfo(skillId)

        // Fix Skill Level Overflow
        if (skillLevel > skillInfo.list.length) {
            skillLevel = skillInfo.list.length
        }

        info.skills.push({
            id: skillId,
            level: skillLevel,
            description: skillInfo.list[skillLevel - 1].description
        })
    })

    info.skills = info.skills.sort((skillA, skillB) => {
        return skillB.level - skillA.level
    })

    return Helper.deepCopy(info)
}

export default {
    getAppliedWeaponInfo: getAppliedWeaponInfo,
    getAppliedArmorInfo: getAppliedArmorInfo,
    getAppliedCharmInfo: getAppliedCharmInfo
}
