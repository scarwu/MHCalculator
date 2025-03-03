/**
 * Kiranico Crawler
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import Helper from '../../../liberaries/helper.mjs'
import {
    setting,
    dateset,
    autoExtendListQuantity,
    normalizeText,
    guessArmorType
} from '../../../liberaries/mh.mjs'

const tempRoot = 'temp/crawler/wilds/kiranico'

const info = {
    baseUrl: 'https://mhwilds.kiranico.com',
    langs: {
        zhTW: 'https://mhwilds.kiranico.com/zh-Hant',
        jaJP: 'https://mhwilds.kiranico.com/ja',
        enUS: 'https://mhwilds.kiranico.com'
    },
    weapons: {
        target: 'data/weapons',
        typeMapping: {
            greatSword: 'LONG_SWORD',
            swordAndShield: 'SHORT_SWORD',
            dualBlades: 'TWIN_SWORD',
            longSword: 'TACHI',
            hammer: 'HAMMER',
            huntingHorn: 'WHISTLE',
            lance: 'LANCE',
            gunlance: 'GUN_LANCE',
            switchAxe: 'SLASH_AXE',
            chargeBlade: 'CHARGE_AXE',
            insectGlaive: 'ROD',
            bow: 'BOW',
            heavyBowgun: 'HEAVY_BOWGUN',
            lightBowgun: 'LIGHT_BOWGUN'
        }
    },
    armors: 'data/armor-series',
    charms: 'data/charms',
    decorations: 'data/decorations',
    skills: 'data/skills'
}

const getFullUrl = (lang, url) => {
    return `${info.langs[lang]}/${url}`
}

export const fetchWeaponsAction = async (params = null) => {
    const runner = async (weaponType) => {
        let mapping = {}
        let langKeyMapping = {}

        // Fetch List Page

        for (let lang of Object.keys(info.langs)) {
            let fetchPageUrl = getFullUrl(lang, info.weapons.target)
            let fetchPageName = `weapons:${weaponType}`

            console.log(fetchPageUrl, fetchPageName)

            // Fetch Menu
            let menuDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                cachePrefix: `wilds/weapons/${weaponType}`,
                headless: {}
            })

            if (Helper.isEmpty(menuDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            let selector = menuDom('div[role="tablist"] > button[role="tab"]').eq(0).attr('id')
            selector = selector.replaceAll(':', '\\:').replace('LONG_SWORD', info.weapons.typeMapping[weaponType])
            selector = `#${selector}`

            // Fetch List
            let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                cachePrefix: `wilds/weapons/${weaponType}`,
                headless: {
                    actions: [
                        { name: 'click', selector: selector }
                    ]
                }
            })

            if (Helper.isEmpty(listDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            for (let rowIndex = 0; rowIndex < listDom('table.w-full.caption-bottom.text-sm').find('tr').length; rowIndex++) {
                let rowNode = listDom('table.w-full.caption-bottom.text-sm').find('tr').eq(rowIndex)

                let name = normalizeText(rowNode.find('> td').eq(1).find('a').text().trim())

                let uniqueKey = rowIndex

                if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                    langKeyMapping[uniqueKey] = `${weaponType}:${name}`
                }

                let mappingKey = langKeyMapping[uniqueKey]

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(dateset.weaponItem)
                    mapping[mappingKey].name = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].description = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].series = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].type = weaponType

                    // Decoration Slots
                    let slotNode = rowNode.find('> td').eq(2).text().trim().split('-')

                    if (Helper.isNotEmpty(slotNode) && 0 !== slotNode.length) {
                        slotNode.forEach((size) => {
                            size = parseInt(size, 10)

                            if (0 === size) {
                                return
                            }

                            mapping[mappingKey].slots.push({
                                size: size
                            })
                        })
                    }

                    // Attack
                    let attack = rowNode.find('> td').eq(3).text().trim()

                    mapping[mappingKey].attack = parseInt(attack, 10)

                    // Element
                    if ('heavyBowgun' !== weaponType
                        && 'lightBowgun' !== weaponType
                        && 0 !== rowNode.find('> td').eq(4).find('img').length
                    ) {
                        rowNode.find('> td').eq(4).find('span').each((index, node) => {
                            switch (listDom(node).find('img').attr('src')) {
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType1.png':
                                mapping[mappingKey].element.attack.type = 'fire'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType2.png':
                                mapping[mappingKey].element.attack.type = 'water'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType3.png':
                                mapping[mappingKey].element.attack.type = 'thunder'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType4.png':
                                mapping[mappingKey].element.attack.type = 'ice'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType5.png':
                                mapping[mappingKey].element.attack.type = 'dragon'
                                mapping[mappingKey].element.attack.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType6.png':
                                mapping[mappingKey].element.status.type = 'poison'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType7.png':
                                mapping[mappingKey].element.status.type = 'sleep'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType8.png':
                                mapping[mappingKey].element.status.type = 'paralysis'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            case 'https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/ElementType9.png':
                                mapping[mappingKey].element.status.type = 'blast'
                                mapping[mappingKey].element.status.minValue = parseFloat(listDom(node).text().trim())

                                break
                            }
                        })
                    }

                    // Critical or defense
                    rowNode.find('> td').eq(5).find('div').each((index, node) => {
                        let text = listDom(node).text().trim()

                        if ('' !== text && -1 !== text.indexOf('%')) {
                            text = text.replace('+', '').replace('%', '').trim()

                            mapping[mappingKey].criticalRate = (0 !== parseInt(text, 10))
                                ? parseInt(text, 10) : null
                        }

                        if ('' !== text && -1 !== text.indexOf('Def')) {
                            text = text.replace('+', '').replace(' Def', '').trim()

                            mapping[mappingKey].defense = (0 !== parseInt(text, 10))
                                ? parseInt(text, 10) : null
                        }
                    })

                    // Sharpness
                    if ('bow' !== weaponType
                        && 'heavyBowgun' !== weaponType
                        && 'lightBowgun' !== weaponType
                    ) {
                        let sharpnessList = [
                            'red',
                            'orange',
                            'yellow',
                            'green',
                            'blue',
                            'white',
                            'purple'
                        ]

                        // minimum sharpness
                        rowNode.find('> td').eq(6).find('svg').eq(0).find('rect').each((index, node) => {
                            let value = parseFloat(listDom(node).attr('width')) * 5

                            if (0 === value || true === isNaN(value)) {
                                return
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.minValue)) {
                                mapping[mappingKey].sharpness.minValue = 0
                            }

                            mapping[mappingKey].sharpness.minValue += value
                        })

                        // maximum sharpness
                        rowNode.find('> td').eq(6).find('svg').eq(1).find('rect').each((index, node) => {
                            let value = parseFloat(listDom(node).attr('width')) * 5

                            if (0 === value || true === isNaN(value)) {
                                return
                            }

                            if (Helper.isEmpty(mapping[mappingKey].sharpness.maxValue)) {
                                mapping[mappingKey].sharpness.maxValue = 0
                            }

                            mapping[mappingKey].sharpness.maxValue += value
                            mapping[mappingKey].sharpness.steps[sharpnessList[index]] = value
                        })
                    }

                    // Skills
                    rowNode.find('> td').eq(8).find('a').each((index, node) => {
                        let text = listDom(node).text().trim().split(' +')

                        mapping[mappingKey].skills.push({
                            name: text[0],
                            level: parseFloat(text[1])
                        })
                    })
                }

                // Fetch Detail Page
                fetchPageUrl = info.baseUrl + rowNode.find('> td').eq(1).find('a').attr('href')
                fetchPageName = `weapons:${weaponType}:${name}`

                console.log(fetchPageUrl, fetchPageName)

                let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                    cachePrefix: `wilds/weapons/${weaponType}`
                })

                if (Helper.isEmpty(weaponDom)) {
                    console.trace(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                let description = weaponDom('blockquote').eq(0).text()

                mapping[mappingKey].name[lang] = name
                mapping[mappingKey].description[lang] = description
            }
        }

        Helper.saveJSONAsCSV(`${tempRoot}/weapons/${weaponType}.csv`, Object.values(mapping))
    }

    let tasks = []

    for (let weaponType in info.weapons.typeMapping) {
        if (Helper.isNotEmpty(params)
            && 0 !== params.length
            && params[0] !== weaponType
        ) {
            continue
        }

        tasks.push(runner(weaponType))
    }

    return Promise.all(tasks).then(() => {
        // pass
    })
}

export const fetchArmorsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, info.armors)
        let fetchPageName = 'armors'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
            cachePrefix: 'wilds/armors'
        })

        if (Helper.isEmpty(listDom)) {
            console.trace(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.w-full.caption-bottom.text-sm').find('tr').length; rowIndex++) {
            let rowNode = listDom('table.w-full.caption-bottom.text-sm').find('tr').eq(rowIndex)

            if ('' === rowNode.find('> td').eq(0).text()) {
                continue
            }

            let seriesName = normalizeText(rowNode.find('> td').eq(0).find('a').text().trim())

            // Fetch Detail Page
            fetchPageUrl = info.baseUrl + rowNode.find('> td').eq(0).find('a').attr('href')
            fetchPageName = `armors:${seriesName}`

            console.log(fetchPageUrl, fetchPageName)

            let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                cachePrefix: `wilds/armors`
            })

            if (Helper.isEmpty(armorDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            if (4 !== armorDom('table.w-full.caption-bottom.text-sm').length) {
                continue
            }

            // Name & Description
            for (let index = 0; index < armorDom('table.w-full.caption-bottom.text-sm').eq(0).find('tr').length; index++) {
                let node = armorDom('table.w-full.caption-bottom.text-sm').eq(0).find('tr').eq(index)

                let armorName = normalizeText(armorDom(node).find('> td').eq(0).text().trim())
                let armorDescription = armorDom(node).find('> td').eq(1).text().trim()

                let armorIndex = index
                let uniqueKey = `${rowIndex}:${armorIndex}`

                if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                    langKeyMapping[uniqueKey] = armorName
                }

                let mappingKey = langKeyMapping[uniqueKey]

                if (Helper.isEmpty(mapping[mappingKey])) {
                    mapping[mappingKey] = Helper.deepCopy(dateset.armorItem)
                    mapping[mappingKey].name = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].description = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                    mapping[mappingKey].series = {
                        zhTW: null,
                        jaJP: null,
                        enUS: null
                    }
                }

                mapping[mappingKey].name[lang] = armorName
                mapping[mappingKey].description[lang] = armorDescription
                mapping[mappingKey].series[lang] = seriesName
            }

            if (lang === 'zhTW') {

                // Defense & Resistance
                for (let index = 0; index < armorDom('table.w-full.caption-bottom.text-sm').eq(1).find('tr').length; index++) {
                    if (0 === index) {
                        continue
                    }

                    let node = armorDom('table.w-full.caption-bottom.text-sm').eq(1).find('tr').eq(index)

                    let armorType = armorDom(node).find('> td').eq(0).text().trim()
                    let armorName = normalizeText(armorDom(node).find('> td').eq(1).text().trim())

                    let armorIndex = index - 1
                    let uniqueKey = `${rowIndex}:${armorIndex}`

                    if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                        langKeyMapping[uniqueKey] = armorName
                    }

                    let mappingKey = langKeyMapping[uniqueKey]

                    switch (armorType) {
                    case '头部防具':
                        mapping[mappingKey].type = 'helm'
                        break
                    case '身体防具':
                        mapping[mappingKey].type = 'chest'
                        break
                    case '臂部防具':
                        mapping[mappingKey].type = 'arm'
                        break
                    case '腰部防具':
                        mapping[mappingKey].type = 'waist'
                        break
                    case '脚部防具':
                        mapping[mappingKey].type = 'leg'
                        break
                    }

                    mapping[mappingKey].minDefense = parseFloat(armorDom(node).find('> td').eq(2).text().trim())
                    mapping[mappingKey].maxDefense = parseFloat(armorDom(node).find('> td').eq(2).text().trim())
                    mapping[mappingKey].resistance.fire = parseFloat(armorDom(node).find('> td').eq(3).text().trim())
                    mapping[mappingKey].resistance.water = parseFloat(armorDom(node).find('> td').eq(4).text().trim())
                    mapping[mappingKey].resistance.thunder = parseFloat(armorDom(node).find('> td').eq(5).text().trim())
                    mapping[mappingKey].resistance.ice = parseFloat(armorDom(node).find('> td').eq(6).text().trim())
                    mapping[mappingKey].resistance.dragon = parseFloat(armorDom(node).find('> td').eq(7).text().trim())
                }

                // Slots & Skills
                for (let index = 0; index < armorDom('table.w-full.caption-bottom.text-sm').eq(2).find('tr').length; index++) {
                    if (0 === index) {
                        continue
                    }

                    let node = armorDom('table.w-full.caption-bottom.text-sm').eq(2).find('tr').eq(index)
                    let armorName = normalizeText(armorDom(node).find('> td').eq(1).text().trim())

                    let armorIndex = index - 1
                    let uniqueKey = `${rowIndex}:${armorIndex}`

                    if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                        langKeyMapping[uniqueKey] = armorName
                    }

                    let mappingKey = langKeyMapping[uniqueKey]

                    // Slots
                    let slotNode = armorDom(node).find('> td').eq(2).text().split('][')

                    if (Helper.isNotEmpty(slotNode) && 0 !== slotNode.length) {
                        slotNode.forEach((size) => {
                            size = size.replace('[', '').replace(']', '')
                            size = parseInt(size, 10)

                            if (0 === size) {
                                return
                            }

                            mapping[mappingKey].slots.push({
                                size: size
                            })
                        })
                    }

                    // Skills
                    armorDom(node).find('> td').eq(3).find('a').each((index, node) => {
                        let text = listDom(node).text().trim().split(' +')

                        mapping[mappingKey].skills.push({
                            name: text[0],
                            level: parseFloat(text[1])
                        })
                    })
                }
            }
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/armors.csv`, Object.values(mapping))
}

export const fetchCharmsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, info.charms)
        let fetchPageName = 'charms'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
            cachePrefix: 'wilds/charms'
        })

        if (Helper.isEmpty(listDom)) {
            console.trace(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.w-full.caption-bottom.text-sm').find('tr').length; rowIndex++) {
            let rowNode = listDom('table.w-full.caption-bottom.text-sm').find('tr').eq(rowIndex)

            let name = normalizeText(rowNode.find('> td').eq(0).find('a').text().trim())

            let uniqueKey = rowIndex

            if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                langKeyMapping[uniqueKey] = name
            }

            let mappingKey = langKeyMapping[uniqueKey]

            // Fetch Detail Page
            fetchPageUrl = info.baseUrl + rowNode.find('> td').eq(0).find('a').attr('href')
            fetchPageName = `charms:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let charmDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                cachePrefix: `wilds/charms`
            })

            if (Helper.isEmpty(charmDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            let description = charmDom('blockquote').eq(0).text()

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(dateset.charmItem)
                mapping[mappingKey].name = {
                    zhTW: null,
                    jaJP: null,
                    enUS: null
                }
                mapping[mappingKey].description = {
                    zhTW: null,
                    jaJP: null,
                    enUS: null
                }
                mapping[mappingKey].series = {
                    zhTW: null,
                    jaJP: null,
                    enUS: null
                }

                charmDom('table.w-full.caption-bottom.text-sm').find('tr').each((index, node) => {
                    let skillName = charmDom(node).find('> td').eq(0).text().trim()
                    let skillLevel = parseFloat(charmDom(node).find('> td').eq(1).text().replace('Lv', '').trim())

                    mapping[mappingKey].skills.push({
                        name: skillName,
                        level: skillLevel
                    })
                })
            }

            mapping[mappingKey].name[lang] = name
            mapping[mappingKey].description[lang] = description
            mapping[mappingKey].series[lang] = name.replace(/(I|II|III|IV)$/, '').trim()
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/charms.csv`, Object.values(mapping))
}

export const fetchDecorationsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, info.decorations)
        let fetchPageName = 'decorations'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
            cachePrefix: 'wilds/decorations'
        })

        if (Helper.isEmpty(listDom)) {
            console.trace(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.w-full.caption-bottom.text-sm').find('tr').length; rowIndex++) {
            let rowNode = listDom('table.w-full.caption-bottom.text-sm').find('tr').eq(rowIndex)

            let name = normalizeText(rowNode.find('> td').eq(0).find('a').text().trim())

            let uniqueKey = rowIndex

            if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                langKeyMapping[uniqueKey] = name
            }

            let mappingKey = langKeyMapping[uniqueKey]

            // Fetch Detail Page
            fetchPageUrl = info.baseUrl + rowNode.find('> td').eq(0).find('a').attr('href')
            fetchPageName = `decorations:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let decorationDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                cachePrefix: `wilds/decorations`
            })

            if (Helper.isEmpty(decorationDom)) {
                console.trace(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            let description = decorationDom('blockquote').eq(0).text()

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(dateset.decorationItem)
                mapping[mappingKey].name = {
                    zhTW: null,
                    jaJP: null,
                    enUS: null
                }
                mapping[mappingKey].description = {
                    zhTW: null,
                    jaJP: null,
                    enUS: null
                }

                if (-1 !== name.indexOf('【1】')) {
                    mapping[mappingKey].size = 1
                } else if (-1 !== name.indexOf('【2】')) {
                    mapping[mappingKey].size = 2
                } else if (-1 !== name.indexOf('【3】')) {
                    mapping[mappingKey].size = 3
                } else if (-1 !== name.indexOf('【4】')) {
                    mapping[mappingKey].size = 4
                }

                decorationDom('table.w-full.caption-bottom.text-sm').find('tr').each((index, node) => {
                    let skillName = decorationDom(node).find('> td').eq(0).text().trim()
                    let skillLevel = parseFloat(decorationDom(node).find('> td').eq(1).text().replace('Lv', '').trim())

                    mapping[mappingKey].skills.push({
                        name: skillName,
                        level: skillLevel
                    })
                })
            }

            mapping[mappingKey].name[lang] = name
            mapping[mappingKey].description[lang] = description
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/decorations.csv`, Object.values(mapping))
}

export const fetchSkillsAction = async () => {
    let mapping = {}
    let langKeyMapping = {}

    // Fetch List Page
    for (let lang of ['zhTW', 'jaJP', 'enUS']) {
        let fetchPageUrl = getFullUrl(lang, info.skills)
        let fetchPageName = 'skills'

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
            cachePrefix: 'wilds/charms'
        })

        if (Helper.isEmpty(listDom)) {
            console.trace(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let tableIndex = 0; tableIndex < listDom('h3.scroll-m-20.text-2xl.font-semibold.tracking-tight').length; tableIndex++) {
            let tableName = listDom('h3.scroll-m-20.text-2xl.font-semibold.tracking-tight').eq(tableIndex).text().trim().toLowerCase()

            if ('group' === tableName) {

                continue
            }

            if ('series' === tableName) {

                continue
            }

            for (let rowIndex = 0; rowIndex < listDom('table.w-full.caption-bottom.text-sm').eq(tableIndex).find('tr').length; rowIndex++) {
                let rowNode = listDom('table.w-full.caption-bottom.text-sm').eq(tableIndex).find('tr').eq(rowIndex)

                let name = normalizeText(rowNode.find('> td').eq(0).find('a').text().trim())

                // Fetch Detail Page
                fetchPageUrl = info.baseUrl + rowNode.find('> td').eq(0).find('a').attr('href')
                fetchPageName = `skills:${name}`

                console.log(fetchPageUrl, fetchPageName)

                let skillDom = await Helper.fetchHtmlAsDom(fetchPageUrl, {
                    cachePrefix: `wilds/skills`
                })

                if (Helper.isEmpty(skillDom)) {
                    console.trace(fetchPageUrl, fetchPageName, 'Err')

                    return
                }

                let description = skillDom('blockquote').eq(0).text()

                skillDom('table.w-full.caption-bottom.text-sm').eq(0).find('tr').each((index, node) => {
                    let uniqueKey = `${tableName}:${rowIndex}:${index}`

                    if (Helper.isEmpty(langKeyMapping[uniqueKey])) {
                        langKeyMapping[uniqueKey] = `${name}:${index}`
                    }

                    let mappingKey = langKeyMapping[uniqueKey]

                    if (Helper.isEmpty(mapping[mappingKey])) {
                        // {
                        //     name: null,
                        //     description: null,
                        //     level: null,
                        //     effect: null,
                        //     type: null, // active | passive
                        //     from: {
                        //         weapon: false,
                        //         armor: false,
                        //         charm: false,
                        //         decoration: false,
                        //         rampageDecoration: false,
                        //         set: false
                        //     }
                        // }
                        mapping[mappingKey] = Helper.deepCopy(dateset.skillItem)
                        mapping[mappingKey].name = {
                            zhTW: null,
                            jaJP: null,
                            enUS: null
                        }
                        mapping[mappingKey].description = {
                            zhTW: null,
                            jaJP: null,
                            enUS: null
                        }

                        let skillLevel = parseFloat(skillDom(node).find('> td').eq(0).text().replace('Lv', '').trim())
                        let skillEffect = skillDom(node).find('> td').eq(2).text().trim()

                        mapping[mappingKey].level = skillLevel
                        mapping[mappingKey].effect = skillEffect
                    }

                    mapping[mappingKey].name[lang] = name
                    mapping[mappingKey].description[lang] = description
                })
            }
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/skills.csv`, Object.values(mapping))
}

export const infoAction = () => {

    // Generate Result Format
    let result = {
        weapons: {},
        armors: {},
        charms: {},
        decorations: {},
        skills: {}
    }

    result.weapons.all = 0
    result.armors.all = 0
    result.decorations.all = 0

    for (let weaponType of setting.wilds.weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = 0

        for (let rare of setting.wilds.rareList) {
            result.weapons[weaponType][rare] = 0
        }
    }

    for (let rare of setting.wilds.rareList) {
        result.armors[rare] = 0
    }

    for (let size of setting.wilds.sizeList) {
        result.decorations[size] = 0
    }

    // Weapons
    for (let weaponType of setting.wilds.weaponTypeList) {
        let weaponList = Helper.loadCSVAsJSON(`${tempRoot}/weapons/${weaponType}.csv`)

        if (Helper.isNotEmpty(weaponList)) {
            result.weapons.all += weaponList.length
            result.weapons[weaponType].all += weaponList.length

            for (let item of weaponList) {
                if (Helper.isNotEmpty(item.rare)) {
                    result.weapons[weaponType][`rare${item.rare}`] += 1
                }
            }
        }
    }

    // Armors
    for (let rare of setting.wilds.rareList) {
        let armorList = Helper.loadCSVAsJSON(`${tempRoot}/armors/${rare}.csv`)

        if (Helper.isNotEmpty(armorList)) {
            result.armors.all += armorList.length
            result.armors[rare] = armorList.length
        }
    }

    // Charms
    for (let target of [ 'charms' ]) {
        let targetList = Helper.loadCSVAsJSON(`${tempRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target] = targetList.length
        }
    }

    // Decorations
    for (let target of [ 'decorations' ]) {
        let targetList = Helper.loadCSVAsJSON(`${tempRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target].all = targetList.length

            for (let item of targetList) {
                if (Helper.isNotEmpty(item.size)) {
                    result[target][`size${item.size}`] += 1
                }
            }
        }
    }

    // Skills
    for (let target of [ 'skills' ]) {
        let targetList = Helper.loadCSVAsJSON(`${tempRoot}/${target}.csv`)

        if (Helper.isNotEmpty(targetList)) {
            result[target] = targetList.length
        }
    }

    // Result
    console.log(result)
}

export const fetchAllAction = () => {
    Promise.all([
        fetchWeaponsAction(),
        fetchArmorsAction(),
        fetchCharmsAction(),
        fetchDecorationsAction(),
        fetchSkillsAction()
    ]).then(() => {
        infoAction()
    })
}

export default {
    fetchAllAction,
    fetchWeaponsAction,
    fetchArmorsAction,
    fetchCharmsAction,
    fetchDecorationsAction,
    fetchSkillsAction,
    infoAction
}
