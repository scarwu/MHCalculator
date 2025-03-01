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
import WorldArmors from '@/scripts/datasets/rise/armors.json'
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
        return {
            id: armorBundle[0][0],
            name: armorBundle[0][1],
            rare: armorBundle[0][2],
            gender: armorBundle[0][3],
            items: armorBundle[1].map((armorItem) => {
                return {
                    id: armorItem[0],
                    name: armorItem[1],
                    type: armorItem[2]
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
