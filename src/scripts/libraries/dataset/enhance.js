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

let mapping = {
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
const getDataset = () => {
    let series = null

    if (Helper.isEmpty(mapping[series])) {
        return null
    }

    return mapping[series].map((enhance) => {
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
}

class EnhanceDataset {

    constructor (list) {
        this.mapping = {}

        if (Helper.isNotEmpty(list)) {
            list.forEach((item) => {
                this.mapping[item.id] = item
            })
        }

        // Filter Conditional
        this.resetFilter()
    }

    resetFilter = () => {
        this.filterSkillName = null
    }

    getIds = () => {
        return Object.keys(this.mapping)
    }

    getItems = () => {
        let result = Object.values(this.mapping).filter((data) => {
            if (Helper.isNotEmpty(this.filterSkillName)) {
                if (this.filterSkillName !== data.skill.id) {
                    return false
                }
            }

            return true
        })

        this.resetFilter()

        return result
    }

    getInfo = (id) => {
        return (Helper.isNotEmpty(this.mapping[id]))
            ? Helper.deepCopy(this.mapping[id]) : null
    }

    setInfo = (id, info) => {
        if (Helper.isNotEmpty(info)) {
            this.mapping[id] = info
        } else {
            delete this.mapping[id]
        }
    }

    // Conditional Functions
    hasSkill = (name) => {
        this.filterSkillName = name

        return this
    }
}

export default new EnhanceDataset(getDataset())
