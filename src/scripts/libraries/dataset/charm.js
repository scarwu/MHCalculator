/**
 * Dataset Charm
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import Helper from '@/scripts/core/helper'

// Load States
import States from '@/scripts/states'

// Load Dataset
import WorldCharms from '@/scripts/datasets/world/charms.json'

const mapping = {
    world: WorldCharms,
    rise: null,
    wilds: null
}

// [
//     0: series [
//         0: id,
//         1: name
//     ],
//     1: items [
//         [
//             0: id
//             1: name
//             2: rare
//             3: level
//             4: skills [
//                 [
//                     0: id,
//                     1: level
//                 ]
//             ]
//         ],
//         [ ... ]
//     ]
// ]
let dataset = null

export const init = () => {
    dataset = {}

    let series = States.getters.series()

    if (Helper.isEmpty(mapping[series])) {
        return
    }

    let list = mapping[series].map((bundle) => {
        return bundle[1].map((item) => {
            return {
                seriesId: bundle[0][0],
                series: bundle[0][1],
                id: item[0],
                name: item[1],
                rare: item[2],
                level: item[3],
                skills: (Helper.isNotEmpty(item[4])) ? item[4].map((skill) => {
                    return {
                        id: skill[0],
                        level: skill[1]
                    }
                }) : []
            }
        })
    })
    .reduce((charmsA, charmsB) => {
        return charmsA.concat(charmsB)
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

    let result = Object.values(dataset).filter((data) => {
        let isSkip = true

        // Rare Is
        if (Helper.isNotEmpty(filter.rare)) {
            if (filter.rare !== data.rare) {
                return false
            }
        }

        // Has Skill
        if (Helper.isNotEmpty(filter.skillName)) {
            for (let index in data.skills) {
                if (filter.skillName !== data.skills[index].id) {
                    continue
                }

                isSkip = false
            }

            if (isSkip) {
                return false
            }
        }

        // Has Skills
        if (Helper.isNotEmpty(filter.skillNames)) {
            if (filter.skillIsConsistent) {
                isSkip = false

                data.skills.forEach((skill) => {
                    if (-1 === filter.skillNames.indexOf(skill.id)) {
                        isSkip = true
                    }
                })
            } else {
                isSkip = true

                data.skills.forEach((skill) => {
                    if (-1 !== filter.skillNames.indexOf(skill.id)) {
                        isSkip = false
                    }
                })
            }

            if (isSkip) {
                return false
            }
        }

        return true
    })

    return result
}

export const getInfo = (id) => {
    if (Helper.isEmpty(dataset)) {
        init()
    }

    return (Helper.isNotEmpty(dataset[id]))
        ? Helper.deepCopy(dataset[id]) : null
}

export const setInfo = (id, info) => {
    if (Helper.isEmpty(dataset)) {
        init()
    }

    if (Helper.isNotEmpty(info)) {
        dataset[id] = info
    } else {
        delete dataset[id]
    }
}

export default {
    init,
    getIds,
    getList,
    getInfo,
    setInfo
}
