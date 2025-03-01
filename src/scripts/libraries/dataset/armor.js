/**
 * Dataset Armor
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load States
import States from '@/scripts/states'

// Load Dataset
import WorldArmors from '@/scripts/datasets/world/armors.json'
import RiseArmors from '@/scripts/datasets/rise/armors.json'

const mapping = {
    world: WorldArmors,
    rise: RiseArmors,
    wilds: null
}

let dataset = null

export const init = () => {
    dataset = {}

    let series = States.getters.series()

    if (Helper.isEmpty(mapping[series])) {
        return
    }

    let list = mapping[series].map((armorBundle) => {
        return armorBundle[1].map((armorItem) => {
            let armorResult = {
                seriesId: armorBundle[0][0],
                series: armorBundle[0][1],
                rare: armorBundle[0][2],
                gender: armorBundle[0][3],
                minDefense: armorBundle[0][4],
                maxDefense: armorBundle[0][5],
                defense: null,
                resistance: {
                    fire: armorBundle[0][6][0],
                    water: armorBundle[0][6][1],
                    thunder: armorBundle[0][6][2],
                    ice: armorBundle[0][6][3],
                    dragon: armorBundle[0][6][4]
                },
                id: armorItem[0],
                name: armorItem[1],
                type: armorItem[2],
                slots: armorItem[3].map((slotData) => {
                    return {
                        size: slotData[0]
                    }
                }),
                skills: armorItem[4].map((skillData) => {
                    return {
                        id: skillData[0],
                        level: skillData[1]
                    }
                })
            }

            // Set Defense
            armorResult.defense = Helper.isNotEmpty(armorResult.maxDefense)
                ? armorResult.maxDefense : armorResult.minDefense

            // Filter Slots
            armorResult.slots = armorResult.slots.filter((slotData) => {
                return Helper.isNotEmpty(slotData.size)
            })

            if (0 === armorResult.slots.length) {
                armorResult.slots = null
            }

            // Filter Skills
            armorResult.skills = armorResult.skills.filter((skillData) => {
                return Helper.isNotEmpty(skillData.id)
                    && Helper.isNotEmpty(skillData.level)
            })

            if (0 === armorResult.skills.length) {
                armorResult.skills = null
            }

            return armorResult
        })
    }).reduce((armorsA, armorsB) => {
        return armorsA.concat(armorsB)
    })

    if (Helper.isEmpty(list) || 0 === list.list) {
        return
    }

    list.forEach((item) => {
        dataset[item.id] = item
    })
}

export const getIds = (filter = {}) => {
    return getList(filter)
}

export const getList = (filter = {}) => {
    if (Helper.isEmpty(dataset)) {
        init()
    }

    let result = Object.values(dataset).filter((item) => {
        let isSkip = true

        // Type Is
        if (Helper.isNotEmpty(filter.type)) {
            if (filter.type !== item.type) {
                return false
            }
        }

        // Types Is
        if (Helper.isNotEmpty(filter.types)) {
            isSkip = false

            if (-1 === filter.types.indexOf(item.type)) {
                isSkip = true
            }

            if (true === isSkip) {
                return false
            }
        }

        // Rare Is
        if (Helper.isNotEmpty(filter.rare)) {
            if (filter.rare !== item.rare) {
                return false
            }
        }

        // Has Skill
        if (Helper.isNotEmpty(filter.skillId)) {
            if (Helper.isEmpty(item.skills)) {
                return false
            }

            for (let index in item.skills) {
                if (filter.skillId !== item.skills[index].id) {
                    continue
                }

                isSkip = false
            }

            if (true === isSkip) {
                return false
            }
        }

        // Has Skills
        if (Helper.isNotEmpty(filter.skillIds)) {
            if (Helper.isEmpty(item.skills)) {
                return false
            }

            if (filter.skillIsConsistent) {
                isSkip = false

                item.skills.forEach((skillData) => {
                    if (-1 === filter.skillIds.indexOf(skillData.id)) {
                        isSkip = true
                    }
                })
            } else {
                isSkip = true

                item.skills.forEach((skillData) => {
                    if (-1 !== filter.skillIds.indexOf(skillData.id)) {
                        isSkip = false
                    }
                })
            }

            if (true === isSkip) {
                return false
            }
        }

        return true
    })

    return result
}

export const getItem = (id) => {
    if (Helper.isEmpty(dataset)) {
        init()
    }

    return (Helper.isNotEmpty(dataset[id]))
        ? Helper.deepCopy(dataset[id]) : null
}

export default {
    init,
    getIds,
    getList,
    getItem
}
