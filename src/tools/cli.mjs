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
import CombineWorldTask from './tasks/combine/world.mjs'
import CombineRiseTask from './tasks/combine/rise.mjs'
import ConvertTask from './tasks/convert.mjs'

let taskMapping = {
    crawler: {
        world: {
            kiranico: CrawlerWorldKiranicoTask
        },
        rise: {
            kiranico: CrawlerRiseKiranicoTask,
            fextralife: CrawlerRiseFextralifeTask,
            game8: CrawlerRiseGame8Task
        }
    },
    combine: {
        world: CombineWorldTask,
        rise: CombineRiseTask
    },
    convert: ConvertTask
}

let segments = process.argv.slice(2)

while (0 < segments.length) {
    let segment = segments[0]

    if (Helper.isEmpty(taskMapping[segment])) {
        break
    }

    taskMapping = taskMapping[segment]
    segments.shift()
}

if (0 === segments.length) {
    console.log('Commands:')

    Object.keys(taskMapping).forEach((segment) => {
        console.log(`    ${segment.replace(/Action$/, '')}`)
    })

    process.exit()
}

let actionName = segments.shift() + 'Action'

if (Helper.isEmpty(taskMapping[actionName])) {
    console.log(`Command "${actionName}" not found`)

    process.exit()
}

// Run CLI
taskMapping[actionName](segments)
