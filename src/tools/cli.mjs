#!/usr/bin/env node
/**
 * CLI Bootstrap
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import * as path from 'path'

// Set Root to Global
global.root = path.dirname(process.argv[1])

import Helper from './liberaries/helper.mjs'
import ConvertTask from './tasks/convert.mjs'
import CombineTask from './tasks/combine.mjs'
import Game8Task from './tasks/game8.mjs'
import GameqbTask from './tasks/gameqb.mjs'
import KiranicobTask from './tasks/kiranico.mjs'
import FextralifeTask from './tasks/fextralife.mjs'

let taskMapping = {
    convert: ConvertTask,
    combine: CombineTask,
    game8: Game8Task,
    gameqb: GameqbTask,
    kiranico: KiranicobTask,
    fextralife: FextralifeTask
}

// Check Task
let taskName = process.argv[2]

if (Helper.isEmpty(taskName)) {
    console.log('Tasks:')

    Object.keys(taskMapping).forEach((taskName) => {
        console.log(`    ${taskName}`)
    })

    process.exit()
} else if (Helper.isEmpty(taskMapping[taskName])) {
    console.log(`Task "${taskName}" not found`)

    process.exit()
}

// Check Action
let actionName = process.argv[3]

if (Helper.isEmpty(actionName)) {
    console.log('Actions:')

    Object.keys(taskMapping[taskName]).forEach((actionName) => {
        console.log(`    ${actionName.replace(/Action$/, '')}`)
    })

    process.exit()
} else if (Helper.isEmpty(taskMapping[taskName][actionName + 'Action'])) {
    console.log(`Task "${taskName}" Action "${actionName}" not found`)

    process.exit()
}

// Run CLI
taskMapping[taskName][actionName + 'Action'](...process.argv.slice(4))
