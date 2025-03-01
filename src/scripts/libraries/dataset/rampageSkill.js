/**
 * Dataset RampageSkill
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
import RiseRampageSkills from '@/scripts/datasets/rise/rampageSkills.json'

const mapping = {
    world: null,
    rise: RiseRampageSkills,
    wilds: null
}

// [
//     0: id,
//     1: name,
//     2: description,
//     3: reaction { ... }
// ]
let dataset = null

export const init = () => {
    dataset = {}

    let series = States.getters.series()

    if (Helper.isEmpty(mapping[series])) {
        return
    }

    let list = mapping[series].map((rampageSkillItem) => {
        return {
            id: rampageSkillItem[0],
            name: rampageSkillItem[1],
            description: rampageSkillItem[2],
            // reaction: {
            //     attack: {
            //         value: rampageSkillItem[3][0][0]
            //     },
            //     attackMultiple: {
            //         value: rampageSkillItem[3][1][0]
            //     },
            //     defense: {
            //         value: rampageSkillItem[3][2][0]
            //     },
            //     defenseMultiple: {
            //         value: rampageSkillItem[3][3][0]
            //     },
            //     criticalRate: {
            //         value: rampageSkillItem[3][4][0]
            //     },
            //     criticalMultiple: {
            //         value: rampageSkillItem[3][5][0]
            //     },
            //     elementAttackCriticalMultiple: {
            //         value: rampageSkillItem[3][6][0]
            //     },
            //     elementStatusCriticalMultiple: {
            //         value: rampageSkillItem[3][7][0]
            //     },
            //     sharpness: {
            //         value: rampageSkillItem[3][8][0]
            //     },
            //     resistance: {
            //         type: rampageSkillItem[3][9][0],
            //         value: rampageSkillItem[3][9][1]
            //     },
            //     resistanceMultiple: {
            //         type: rampageSkillItem[3][10][0],
            //         value: rampageSkillItem[3][10][1]
            //     },
            //     elementAttack: {
            //         type: rampageSkillItem[3][11][0],
            //         value: rampageSkillItem[3][11][1],
            //         multiple: rampageSkillItem[3][11][2]
            //     },
            //     elementStatus: {
            //         type: rampageSkillItem[3][12][0],
            //         value: rampageSkillItem[3][12][1],
            //         multiple: rampageSkillItem[3][12][2]
            //     },
            //     skillLevelUp: {
            //         value: rampageSkillItem[3][13][0]
            //     }
            // }
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
