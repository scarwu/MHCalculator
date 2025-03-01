/**
 * Dataset Enhance
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
import WorldEnhances from '@/scripts/datasets/world/enhances.json'

const mapping = {
    world: WorldEnhances,
    rise: null,
    wilds: null
}

// [
//     0: id,
//     1: name,
//     2: allowRares,
//     4: list [
//         [
//             0: level,
//             1: description,
//             2: allowRares,
//             3: size,
//             4: reaction { ... }
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

    let list = mapping[series].map((enhance) => {
        return {
            id: enhance[0],
            name: enhance[1],
            allowRares: enhance[2],
            list: enhance[3].map((item) => {
                return {
                    level: item[0],
                    description: item[1],
                    allowRares: item[2],
                    size: item[3],
                    reaction: item[4]
                }
            })
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

    let result = Object.values(dataset).filter((data) => {
        if (Helper.isNotEmpty(filter.skillName)) {
            if (filter.skillName !== data.skill.id) {
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
