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

let mapping = {
    world: WorldArmors,
    rise: RiseArmors,
    wilds: null
}

const getDataset = () => {
    let series = null

    if (Helper.isEmpty(mapping[series])) {
        return null
    }

    return mapping[series].map((armorBundle) => {
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
}

class SetDataset {

    constructor (list) {
        this.mapping = {}

        if (Helper.isNotEmpty(list)) {
            list.forEach((item) => {
                this.mapping[item.id] = item
            })
        }
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getList = () => {
        let result = Object.values(this.mapping)

        return result
    }

    getItem = (id) => {
        return (Helper.isNotEmpty(this.mapping[id]))
            ? Helper.deepCopy(this.mapping[id]) : null
    }
}

export default new SetDataset(getDataset())
