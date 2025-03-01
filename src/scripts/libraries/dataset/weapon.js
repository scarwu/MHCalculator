/**
 * Dataset Weapon
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
import WorldWeapons from '@/scripts/datasets/world/weapons.json'
import RiseWeapons from '@/scripts/datasets/rise/weapons.json'

const mapping = {
    world: WorldWeapons,
    rise: RiseWeapons,
    wilds: null
}

let dataset = null

export const init = () => {
    dataset = {}

    let series = States.getters.series()

    if (Helper.isEmpty(mapping[series])) {
        return
    }

    let list = mapping[series].map((weaponItem) => {
        let weaponResult = {
            id: weaponItem[0],
            series: weaponItem[1],
            name: weaponItem[2],
            rare: weaponItem[3],
            type: weaponItem[4],
            attack: weaponItem[5],
            criticalRate: weaponItem[6],
            defense: weaponItem[7],
            element: {
                attack: {
                    type: weaponItem[8][0][0],
                    minValue: weaponItem[8][0][1],
                    maxValue: weaponItem[8][0][2],
                    value: null
                },
                status: {
                    type: weaponItem[8][1][0],
                    minValue: weaponItem[8][1][1],
                    maxValue: weaponItem[8][1][2],
                    value: null
                }
            },
            sharpness: {
                minValue: weaponItem[9][0],
                maxValue: weaponItem[9][1],
                value: null,
                steps: {
                    red: weaponItem[9][2][0],
                    orange: weaponItem[9][2][1],
                    yellow: weaponItem[9][2][2],
                    green: weaponItem[9][2][3],
                    blue: weaponItem[9][2][4],
                    white: weaponItem[9][2][5],
                    purple: weaponItem[9][2][6]
                }
            },
            slots: weaponItem[10].map((slotData) => {
                return {
                    size: slotData[0]
                }
            }),
            // rampageSlot: {
            //     size: weaponItem[11][0]
            // },
            rampageSkill: {
                amount: weaponItem[11][0],
                // list: weaponItem[12][1].map((rampageSkillData) => {
                //     return {
                //         name: rampageSkillData[0]
                //     }
                // })
            }
        }

        // Set Values
        if (Helper.isEmpty(weaponResult.attack)) {
            weaponResult.attack = 0
        }

        if (Helper.isEmpty(weaponResult.criticalRate)) {
            weaponResult.criticalRate = 0
        }

        if (Helper.isEmpty(weaponResult.defense)) {
            weaponResult.defense = 0
        }

        // Filter Element Attack & Set Value
        if (Helper.isNotEmpty(weaponResult.element.attack)
            && Helper.isNotEmpty(weaponResult.element.attack.type)
            && Helper.isNotEmpty(weaponResult.element.attack.minValue)
        ) {
            weaponResult.element.attack.value = Helper.isNotEmpty(weaponResult.element.attack.maxValue)
                ? weaponResult.element.attack.maxValue
                : weaponResult.element.attack.minValue
        } else {
            weaponResult.element.attack = null
        }

        // Filter Element Status & Set Value
        if (Helper.isNotEmpty(weaponResult.element.status)
            && Helper.isNotEmpty(weaponResult.element.status.type)
            && Helper.isNotEmpty(weaponResult.element.status.minValue)
        ) {
            weaponResult.element.status.value = Helper.isNotEmpty(weaponResult.element.status.maxValue)
                ? weaponResult.element.status.maxValue
                : weaponResult.element.status.minValue
        } else {
            weaponResult.element.status = null
        }

        // Filter Sharpness
        if (Helper.isNotEmpty(weaponResult.sharpness.minValue)
            && Helper.isNotEmpty(weaponResult.sharpness.steps)
            && (Helper.isNotEmpty(weaponResult.sharpness.steps.red)
                || Helper.isNotEmpty(weaponResult.sharpness.steps.orange)
                || Helper.isNotEmpty(weaponResult.sharpness.steps.yellow)
                || Helper.isNotEmpty(weaponResult.sharpness.steps.green)
                || Helper.isNotEmpty(weaponResult.sharpness.steps.blue)
                || Helper.isNotEmpty(weaponResult.sharpness.steps.white)
                || Helper.isNotEmpty(weaponResult.sharpness.steps.purple)
            )
        ) {
            weaponResult.sharpness.value = weaponResult.sharpness.minValue
        } else {
            weaponResult.sharpness = null
        }

        // Filter Slots
        weaponResult.slots = weaponResult.slots.filter((slotData) => {
            return Helper.isNotEmpty(slotData.size)
        })

        if (0 === weaponResult.slots.length) {
            weaponResult.slots = null
        }

        return weaponResult
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
        // if (Helper.isNotEmpty(filter.skillId)) {
        //     if (Helper.isEmpty(item.skills)) {
        //         return false
        //     }

        //     for (let index in item.skills) {
        //         if (filter.skillId !== item.skills[index].id) {
        //             continue
        //         }

        //         isSkip = false
        //     }

        //     if (true === isSkip) {
        //         return false
        //     }
        // }

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
