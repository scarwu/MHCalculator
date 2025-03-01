/**
 * Dataset RampageDecoration
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
import RiseRampageDecorations from '@/scripts/datasets/rise/rampageDecorations.json'

const mapping = {
    world: null,
    rise: RiseRampageDecorations,
    wilds: null
}

// [
//     0: id,
//     1: name,
//     2: rare,
//     3: size,
//     4: skill [
//         0: id,
//         1: level
//     ]
// ]
let dataset = null

export const init = () => {
    dataset = {}

    let series = States.getters.series()

    if (Helper.isEmpty(mapping[series])) {
        return
    }

    let list = mapping[series].map((decorationItem) => {
        return {
            id: decorationItem[0],
            name: decorationItem[1],
            rare: decorationItem[2],
            size: decorationItem[3],
            skill: {
                id: decorationItem[4][0],
                level: decorationItem[4][1]
            }
        }
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

        // Rare Is
        if (Helper.isNotEmpty(filter.rare)) {
            if (filter.rare !== item.rare) {
                return false
            }
        }

        // Size Is
        if (Helper.isNotEmpty(filter.size)) {
            switch (filter.sizeCondition) {
            case 'equal':
                if (filter.size !== item.size) {
                    return false
                }

                break
            case 'greaterEqual':
                if (filter.size > item.size) {
                    return false
                }

                break
            }
        }

        // // Has Skill
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

        // // Has Skills
        // if (Helper.isNotEmpty(filter.skillIds)) {
        //     if (Helper.isEmpty(item.skills)) {
        //         return false
        //     }

        //     if (filter.skillIsConsistent) {
        //         isSkip = false

        //         item.skills.forEach((skillData) => {
        //             if (-1 === filter.skillIds.indexOf(skillData.id)) {
        //                 isSkip = true
        //             }
        //         })
        //     } else {
        //         isSkip = true

        //         item.skills.forEach((skillData) => {
        //             if (-1 !== filter.skillIds.indexOf(skillData.id)) {
        //                 isSkip = false
        //             }
        //         })
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
