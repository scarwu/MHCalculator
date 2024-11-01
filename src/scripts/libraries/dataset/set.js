/**
 * Dataset Armor
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

// Load Core
import Helper from '@/scripts/core/helper'

// Load Dataset
import Armors from '@/scripts/datasets/armors.json'

const dataset = Armors.map((armorBundle) => {
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

class SetDataset {

    constructor (list) {
        this.mapping = {}

        list.forEach((item) => {
            this.mapping[item.id] = item
        })
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

export default new SetDataset(dataset)
