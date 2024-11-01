/**
 * Misc Library
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load Libraries
import WeaponDataset from '@/scripts/libraries/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/dataset/armor'
import SetDataset from '@/scripts/libraries/dataset/set'
import PetalaceDataset from '@/scripts/libraries/dataset/petalace'
import DecorationDataset from '@/scripts/libraries/dataset/decoration'
import RampageSkillDataset from '@/scripts/libraries/dataset/rampageSkill'
import SkillDataset from '@/scripts/libraries/dataset/skill'

export const verifyCustomWeaponItem = (customDataset) => {
    if ('lightBowgun' === customDataset.type
        || 'heavyBowgun' === customDataset.type
        || 'bow' === customDataset.type
    ) {
        customDataset.sharpness = null
    } else if (Helper.isEmpty(customDataset.sharpness.value)
        || Helper.isEmpty(customDataset.sharpness.steps)
        || (Helper.isEmpty(customDataset.sharpness.steps.red)
            && Helper.isEmpty(customDataset.sharpness.steps.orange)
            && Helper.isEmpty(customDataset.sharpness.steps.yellow)
            && Helper.isEmpty(customDataset.sharpness.steps.green)
            && Helper.isEmpty(customDataset.sharpness.steps.blue)
            && Helper.isEmpty(customDataset.sharpness.steps.white)
            && Helper.isEmpty(customDataset.sharpness.steps.purple)
        )
    ) {
        customDataset.sharpness = null
    }

    if (Helper.isEmpty(customDataset.element.attack.type)
        || Helper.isEmpty(customDataset.element.attack.value)
    ) {
        customDataset.element.attack = null
    }

    if (Helper.isEmpty(customDataset.element.status.type)
        || Helper.isEmpty(customDataset.element.status.value)
    ) {
        customDataset.element.status = null
    }

    customDataset.slots = customDataset.slots.filter((slotData) => {
        return Helper.isNotEmpty(slotData.size)
    })

    return customDataset
}

export const verifyCustomCharmItem = (customDataset) => {
    customDataset.slots = customDataset.slots.filter((slotData) => {
        return Helper.isNotEmpty(slotData.size)
    })

    customDataset.skills = customDataset.skills.filter((skillData) => {
        return Helper.isNotEmpty(skillData.id) && Helper.isNotEmpty(skillData.level)
    })

    return customDataset
}

export const getWeaponExtendItem = (equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    let weaponItem = null

    if ('customWeapon' === equipData.id) {
        weaponItem = Helper.deepCopy(equipData.custom)
        weaponItem = verifyCustomWeaponItem(weaponItem)
    } else {
        weaponItem = WeaponDataset.getItem(equipData.id)
    }

    if (Helper.isEmpty(weaponItem)) {
        return null
    }

    // Set Extends
    weaponItem.extends = {
        decorationIds: Helper.deepCopy(equipData.decorationIds),
        rampageSkillIds: Helper.deepCopy(equipData.rampageSkillIds)
    }

    // Handle Skills
    let skillMapping = {}

    if (Helper.isNotEmpty(weaponItem.skills)) {
        weaponItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(skillMapping[skillData.id])) {
                skillMapping[skillData.id] = skillData
            }
        })
    }

    weaponItem.extends.decorationIds.forEach((decorationId) => {
        let decorationItem = DecorationDataset.getItem(decorationId)

        if (Helper.isEmpty(decorationItem)) {
            return
        }

        decorationItem.skills.forEach((skillData) => {
            let skillItem = SkillDataset.getItem(skillData.id)

            if (Helper.isEmpty(skillItem)) {
                return
            }

            if (Helper.isEmpty(skillMapping[skillItem.id])) {
                skillMapping[skillItem.id] = {
                    id: skillItem.id,
                    level: 0
                }
            }

            skillMapping[skillItem.id].level += skillData.level

            if (skillMapping[skillItem.id].level > skillItem.list.length) {
                skillMapping[skillItem.id].level = skillItem.list.length
            }
        })
    })

    // Replace Skills
    weaponItem.skills = Object.values(skillMapping)
    weaponItem.skills = weaponItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return weaponItem
}

export const getArmorExtendItem = (equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    let armorItem = ArmorDataset.getItem(equipData.id)

    if (Helper.isEmpty(armorItem)) {
        return null
    }

    // Set Extends
    armorItem.extends = {
        decorationIds: Helper.deepCopy(equipData.decorationIds)
    }

    // Handle Skills
    let skillMapping = {}

    if (Helper.isNotEmpty(armorItem.skills)) {
        armorItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(skillMapping[skillData.id])) {
                skillMapping[skillData.id] = skillData
            }
        })
    }

    armorItem.extends.decorationIds.forEach((decorationId) => {
        let decorationItem = DecorationDataset.getItem(decorationId)

        if (Helper.isEmpty(decorationItem)) {
            return
        }

        decorationItem.skills.forEach((skillData) => {
            let skillItem = SkillDataset.getItem(skillData.id)

            if (Helper.isEmpty(skillItem)) {
                return
            }

            if (Helper.isEmpty(skillMapping[skillItem.id])) {
                skillMapping[skillItem.id] = {
                    id: skillItem.id,
                    level: 0
                }
            }

            skillMapping[skillItem.id].level += skillData.level

            if (skillMapping[skillItem.id].level > skillItem.list.length) {
                skillMapping[skillItem.id].level = skillItem.list.length
            }
        })
    })

    // Replace Skills
    armorItem.skills = Object.values(skillMapping)
    armorItem.skills = armorItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return armorItem
}

export const getCharmExtendItem = (equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    if ('customCharm' !== equipData.id) {
        return null
    }

    let charmItem = verifyCustomCharmItem(Helper.deepCopy(equipData.custom))

    if (Helper.isEmpty(charmItem)) {
        return null
    }

    // Set Extends
    charmItem.extends = {
        decorationIds: Helper.deepCopy(equipData.decorationIds)
    }

    // Handle Skills
    let skillMapping = {}

    if (Helper.isNotEmpty(charmItem.skills)) {
        charmItem.skills.forEach((skillData) => {
            if (Helper.isEmpty(skillMapping[skillData.id])) {
                skillMapping[skillData.id] = skillData
            }
        })
    }

    charmItem.extends.decorationIds.forEach((decorationId) => {
        let decorationItem = DecorationDataset.getItem(decorationId)

        if (Helper.isEmpty(decorationItem)) {
            return
        }

        decorationItem.skills.forEach((skillData) => {
            let skillItem = SkillDataset.getItem(skillData.id)

            if (Helper.isEmpty(skillItem)) {
                return
            }

            if (Helper.isEmpty(skillMapping[skillItem.id])) {
                skillMapping[skillItem.id] = {
                    id: skillItem.id,
                    level: 0
                }
            }

            skillMapping[skillItem.id].level += skillData.level

            if (skillMapping[skillItem.id].level > skillItem.list.length) {
                skillMapping[skillItem.id].level = skillItem.list.length
            }
        })
    })

    // Replace Skills
    charmItem.skills = Object.values(skillMapping)
    charmItem.skills = charmItem.skills.sort((skillDataA, skillDataB) => {
        return skillDataB.level - skillDataA.level
    })

    return charmItem
}

export const equipTypeToDatasetType = (equipType) => {
    switch (equipType) {
    case 'weapon':
    case 'petalace':
    case 'charm':
        return equipType
    case 'helm':
    case 'chest':
    case 'arm':
    case 'waist':
    case 'leg':
        return 'armor'
    default:
        return null
    }
}

export const getEquipExtendItem = (equipType, equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    switch (equipTypeToDatasetType(equipType)) {
        case 'weapon':
            return getWeaponExtendItem(equipData)
        case 'armor':
            return getArmorExtendItem(equipData)
        case 'petalace':
            return Helper.deepCopy(PetalaceDataset.getItem(equipData.id))
        case 'charm':
            return getCharmExtendItem(equipData)
        default:
            return null
    }
}

export const getEquipItem = (equipType, equipData) => {
    if (Helper.isEmpty(equipData.id)) {
        return null
    }

    switch (equipTypeToDatasetType(equipType)) {
    case 'weapon':
        return ('customWeapon' === equipData.id)
            ? verifyCustomWeaponItem(Helper.deepCopy(equipData.custom))
            : Helper.deepCopy(WeaponDataset.getItem(equipData.id))
    case 'armor':
        return Helper.deepCopy(ArmorDataset.getItem(equipData.id))
    case 'petalace':
        return Helper.deepCopy(PetalaceDataset.getItem(equipData.id))
    case 'charm':
        return ('customCharm' === equipData.id)
            ? verifyCustomCharmItem(Helper.deepCopy(equipData.custom)) : null
    default:
        return null
    }
}

export const getArmorListByRequiredConditions = (requiredConditions) => {
    let armorMapping = {}
    let skillLevelMapping = {}

    const equipTypes = Object.keys(requiredConditions.equips).filter((equipType) => {
        if ('weapon' === equipType || 'charm' === equipType || 'petalace' === equipType) {
            return false
        }

        if (Helper.isEmpty(requiredConditions.equips[equipType])) {
            return true
        }

        return Helper.isEmpty(requiredConditions.equips[equipType].id)
    })
    const setIds = requiredConditions.sets.map((setData) => {
        return setData.id
    })
    const skillIds = requiredConditions.skills.map((skillData) => {
        skillLevelMapping[skillData.id] = skillData.level

        return skillData.id
    })

    // Find Armor By Set Ids
    if (0 !== setIds.length) {
        SetDataset.getList().forEach((setItem) => {
            if (-1 === setIds.indexOf(setItem.id)) {
                return
            }

            setItem.items.forEach((armorData) => {
                if (-1 === equipTypes.indexOf(armorData.type)) {
                    return
                }

                let armorItem = ArmorDataset.getItem(armorData.id)

                if (Helper.isEmpty(armorItem)) {
                    return
                }

                if (Helper.isNotEmpty(armorItem.skills)) {
                    let isSkip = false

                    armorItem.skills.forEach((skillData) => {
                        if (true === isSkip) {
                            return
                        }

                        if (0 === skillLevelMapping[skillData.id]) {
                            isSkip = true

                            return
                        }
                    })

                    if (true === isSkip) {
                        return
                    }
                }

                // Set Mapping
                if (Helper.isEmpty(armorMapping[armorItem.id])) {
                    armorMapping[armorItem.id] = armorItem
                }
            })
        })
    }

    // Find Armors By Skill Ids
    let isConsistent = false

    ArmorDataset.typesIs(equipTypes).hasSkills(skillIds, isConsistent).getList().forEach((armorItem) => {
        if (Helper.isNotEmpty(armorItem.skills)) {
            let isSkip = false

            armorItem.skills.forEach((skillData) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skillData.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }
        }

        // Set Mapping
        if (Helper.isEmpty(armorMapping[armorItem.id])) {
            armorMapping[armorItem.id] = armorItem
        }
    })

    return Object.values(armorMapping)
}

export const getDecorationListByRequiredConditions = (requiredConditions) => {
    let decorationMapping = {}
    let skillLevelMapping = {}

    const skillIds = requiredConditions.skills.map((skillData) => {
        skillLevelMapping[skillData.id] = skillData.level

        return skillData.id
    })

    // Find Decorations By Skill Ids
    let isConsistent = true

    DecorationDataset.hasSkills(skillIds, isConsistent).getList().forEach((decorationItem) => {
        let isSkip = false

        decorationItem.skills.forEach((skillData) => {
            if (true === isSkip) {
                return
            }

            if (0 === skillLevelMapping[skillData.id]) {
                isSkip = true

                return
            }
        })

        if (true === isSkip) {
            return
        }

        if (Helper.isEmpty(decorationMapping[decorationItem.id])) {
            decorationMapping[decorationItem.id] = decorationItem
        }
    })

    return Object.values(decorationMapping)
}

export default {
    getEquipExtendItem,
    getEquipItem,
    equipTypeToDatasetType,

    getArmorListByRequiredConditions,
    getDecorationListByRequiredConditions
}
