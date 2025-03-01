/**
 * Dataset Set
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
import RisePetalaces from '@/scripts/datasets/rise/petalaces.json'

const mapping = {
    world: null,
    rise: RisePetalaces,
    wilds: null
}

// [
//     0: id,
//     1: name,
//     2: rare,
//     3: health [
//         0: increment,
//         1: obtain
//     ],
//     4: stamina [
//         0: increment,
//         1: obtain
//     ],
//     5: attack [
//         0: increment,
//         1: obtain
//     ],
//     6: defense [
//         0: increment,
//         1: obtain
//     ]
// ]
let dataset = null

export const init = () => {
    dataset = {}

    let series = States.getters.series()

    if (Helper.isEmpty(mapping[series])) {
        return
    }

    let list = mapping[series].map((petalaceItem) => {
        return {
            id: petalaceItem[0],
            name: petalaceItem[1],
            rare: petalaceItem[2],
            health: {
                increment: petalaceItem[3][0],
                obtain: petalaceItem[3][1]
            },
            stamina: {
                increment: petalaceItem[4][0],
                obtain: petalaceItem[4][1]
            },
            attack: {
                increment: petalaceItem[5][0],
                obtain: petalaceItem[5][1]
            },
            defense: {
                increment: petalaceItem[6][0],
                obtain: petalaceItem[6][1]
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

    let result = Object.values(dataset)

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
