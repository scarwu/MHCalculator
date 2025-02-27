#!/usr/bin/env node
/**
 * CLI Bootstrap
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import * as path from 'path'

// Set Root to Global
global.root = path.dirname(process.argv[1])

import Helper from './liberaries/helper.mjs'

import CrawlerWorldKiranicoTask from './tasks/crawler/world/kiranico.mjs'
import CrawlerRiseKiranicoTask from './tasks/crawler/rise/kiranico.mjs'
import CrawlerRiseFextralifeTask from './tasks/crawler/rise/fextralife.mjs'
import CrawlerRiseGame8Task from './tasks/crawler/rise/game8.mjs'
import CrawlerRiseGameqbTask from './tasks/crawler/rise/gameqb.mjs'

import CombineWorldTask from './tasks/combine/world.mjs'
import CombineRiseTask from './tasks/combine/rise.mjs'

import ConvertTask from './tasks/convert.mjs'

let taskMapping = {
    crawlerWorldKiranico: CrawlerWorldKiranicoTask,

    crawlerRiseKiranico: CrawlerRiseKiranicoTask,
    crawlerRiseFextralife: CrawlerRiseFextralifeTask,
    crawlerRiseGame8: CrawlerRiseGame8Task,
    crawlerRiseGameqb: CrawlerRiseGameqbTask,

    combineWorld: CombineWorldTask,
    combineRise: CombineRiseTask,

    convert: ConvertTask
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
