/**
 * Fextralife Crawler
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import Helper from '../liberaries/helper.mjs'
import {
    defaultWeaponItem,
    defaultArmorItem,
    // defaultPetalaceItem,
    defaultDecorationItem,
    defaultRampageSkillItem,
    defaultSkillItem,
    autoExtendListQuantity,
    normalizeText,
    weaponTypeList,
    rareList,
    sizeList
} from '../liberaries/mh.mjs'

const tempRoot = 'temp/crawler/fextralife'

const urls = {
    domain: 'https://monsterhunterrise.wiki.fextralife.com',
    weapons: { // https://monsterhunterrise.wiki.fextralife.com/Weapons
        greatSword: 'https://monsterhunterrise.wiki.fextralife.com/Great+Sword',
        swordAndShield: 'https://monsterhunterrise.wiki.fextralife.com/Sword+&+Shield',
        dualBlades: 'https://monsterhunterrise.wiki.fextralife.com/Dual+Blades',
        longSword: 'https://monsterhunterrise.wiki.fextralife.com/Long+Sword',
        hammer: 'https://monsterhunterrise.wiki.fextralife.com/Hammer',
        huntingHorn: 'https://monsterhunterrise.wiki.fextralife.com/Hunting+Horn',
        lance: 'https://monsterhunterrise.wiki.fextralife.com/Lance',
        gunlance: 'https://monsterhunterrise.wiki.fextralife.com/Gunlance',
        switchAxe: 'https://monsterhunterrise.wiki.fextralife.com/Switch+Axe',
        chargeBlade: 'https://monsterhunterrise.wiki.fextralife.com/Charge+Blade',
        insectGlaive: 'https://monsterhunterrise.wiki.fextralife.com/Insect+Glaive',
        bow: 'https://monsterhunterrise.wiki.fextralife.com/Bow',
        heavyBowgun: 'https://monsterhunterrise.wiki.fextralife.com/Heavy+Bowgun',
        lightBowgun: 'https://monsterhunterrise.wiki.fextralife.com/Light+Bowgun'
    },
    armors: 'https://monsterhunterrise.wiki.fextralife.com/Armor',
    // charms: 'https://monsterhunterrise.wiki.fextralife.com/Talismans',
    // petalaces: 'https://monsterhunterrise.wiki.fextralife.com/Petalace',
    decorations: 'https://monsterhunterrise.wiki.fextralife.com/Decorations',
    rampageSkills: 'https://monsterhunterrise.wiki.fextralife.com/Ramp-Up+Skills',
    skills: 'https://monsterhunterrise.wiki.fextralife.com/Skills'
}

export const fetchWeaponsAction = async (targetWeaponType = null) => {
    let fetchPageUrl = null
    let fetchPageName = null

    const specialReplaceName = (text) => {
        let specialWordMapping = {
            '/Rogue+Flames+I': '/Rouge+Flames+I',
            'Rogue Flames I': 'Rouge Flames I',
            '/Bazel+Bluster+II': '/Bazel+Buster+II',
            'Bazel Bluster II': 'Bazel Buster II',
            '/Tigrex+Glaive': '/Tigerclaw+Glaive',
            'Tigrex Glaive': 'Tigerclaw Glaive',

            '/Felyne+Bowgun+II': '/Felyne+Bowwgun+II',
            'Felyne Bowgun II': 'Felyne Bowwgun II'
        }

        if (Helper.isNotEmpty(specialWordMapping[text])) {
            text = specialWordMapping[text]
        }

        return text
    }

    for (let weaponType of Object.keys(urls.weapons)) {
        if (Helper.isNotEmpty(targetWeaponType) && targetWeaponType !== weaponType) {
            continue
        }

        let mapping = {}
        let mappingKey = null

        // Fetch List Page
        fetchPageUrl = urls.weapons[weaponType]
        fetchPageName = `weapons:${weaponType}`

        console.log(fetchPageUrl, fetchPageName)

        let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(listDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        for (let rowIndex = 0; rowIndex < listDom('table.wiki_table.sortable tbody tr').length; rowIndex++) {
            let rowNode = listDom('table.wiki_table.sortable tbody tr').eq(rowIndex)

            // Get Data
            let name = normalizeText(specialReplaceName(rowNode.find('td').eq(0).find('a').text().trim()))

            // Fetch Detail Page
            fetchPageUrl = urls.domain + specialReplaceName(rowNode.find('td').eq(0).find('a').attr('href'))
            fetchPageName = `weapons:${weaponType}:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let weaponDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(weaponDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            let series = normalizeText(weaponDom('h3.special').text().trim()).replace(' Tree', '')

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultWeaponItem)
            }

            mapping[mappingKey].series = {
                enUS: series
            }
            mapping[mappingKey].name = {
                enUS: name
            }
            mapping[mappingKey].gender = null
            mapping[mappingKey].type = weaponType

            let weaponNode = weaponDom('table.wiki_table').eq(0).find('tbody tr')

            // Get Data
            let rare = normalizeText(weaponNode.eq(2).find('div').eq(1).text().trim()).replace('Rarity ', '')
            let defense = weaponNode.eq(3).find('div').eq(0).text().trim()

            defense = ('--' !== defense && '??' !== defense && '' !== defense) ? defense : null

            if ('Kulu Katana II' === name) {
                rare = weaponNode.eq(1).find('div').eq(1).text().trim().replace('Rarity ', '')
                defense = ('--' !== weaponNode.eq(3).find('div').eq(0).text().trim())
                    ? weaponNode.eq(2).find('div').eq(0).text().trim() : null
            }

            if ('Bone Hammer I' === name) {
                console.log(rare)
            }

            if ('I' === rare) {
                rare = 1
            }

            mapping[mappingKey].rare = parseInt(rare, 10)
            mapping[mappingKey].defense = Helper.isNotEmpty(defense)
                ? parseInt(defense, 10) : null

            // Slots
            weaponNode.eq(3).find('div').eq(1).find('img').each((index, node) => {
                switch (weaponDom(node).attr('src')) {
                    case '/file/Monster-Hunter-Rise/gem_level_3_icon_monster_hunter_rise_wiki_guide_24px.png':
                        mapping[mappingKey].slots.push({
                            size: 3
                        })

                        break
                    case '/file/Monster-Hunter-Rise/gem_level_2_icon_monster_hunter_rise_wiki_guide_24px.png':
                        mapping[mappingKey].slots.push({
                            size: 2
                        })

                        break
                    case '/file/Monster-Hunter-Rise/gem_level_1_icon_monster_hunter_rise_wiki_guide_24px.png':
                        mapping[mappingKey].slots.push({
                            size: 1
                        })

                        break
                    default:
                        break
                }
            })

            let attackIndex = null
            let sharpnessIndex = null
            let criticalRateIndex = null
            let elementIndex = null
            let rampageSkillIndex = null

            switch (weaponType) {
            case 'greatSword':
            case 'swordAndShield':
            case 'dualBlades':
            case 'longSword':
            case 'hammer':
            case 'lance':
                attackIndex = 4
                sharpnessIndex = 5
                criticalRateIndex = 6
                elementIndex = 7
                rampageSkillIndex = 8

                break
            case 'huntingHorn':
            case 'switchAxe':
                attackIndex = 4
                sharpnessIndex = 5
                criticalRateIndex = 6
                elementIndex = 7
                rampageSkillIndex = 9

                break
            case 'gunlance':
                attackIndex = 4
                sharpnessIndex = 5
                criticalRateIndex = 6
                elementIndex = 7
                rampageSkillIndex = 10

                break
            case 'chargeBlade':
            case 'insectGlaive':
                attackIndex = 4
                sharpnessIndex = 5
                criticalRateIndex = 6
                elementIndex = 7
                rampageSkillIndex = 9

                break
            case 'bow':
                attackIndex = 4
                criticalRateIndex = 5
                elementIndex = 6
                rampageSkillIndex = 12

                break
            case 'heavyBowgun':
            case 'lightBowgun':
                attackIndex = 4
                criticalRateIndex = 5
                elementIndex = null
                rampageSkillIndex = 12

                break
            }

            if ('Kulu Katana II' === name) {
                attackIndex = 3
                criticalRateIndex = 5
                elementIndex = 6
                rampageSkillIndex = 7
            }

            let attack = weaponNode.eq(attackIndex).find('td').eq(1).text().trim()
            let criticalRate = ('--' !== weaponNode.eq(criticalRateIndex).find('td').eq(1).text().trim())
                ? weaponNode.eq(criticalRateIndex).find('td').eq(1).text().replace('%', '') : null

            mapping[mappingKey].attack = parseInt(attack, 10)
            mapping[mappingKey].criticalRate = parseInt(criticalRate, 10)

            // Element
            if (Helper.isNotEmpty(elementIndex)
                && 'None' !== weaponNode.eq(elementIndex).find('td').eq(1).text().trim()
                && '--' !== weaponNode.eq(elementIndex).find('td').eq(1).text().trim()
            ) {
                weaponNode.eq(elementIndex).find('td').eq(1).text().trim().split('and').forEach((text) => {
                    let match = normalizeText(text.trim()).match(/(.*?)  (\d+)/)

                    if (null === match) {
                        match = normalizeText(text.trim()).match(/(.*?) (\d+)/)
                    }

                    if (null === match) {
                        match = normalizeText(text.trim()).match(/(.*?)(\d+)/)
                    }

                    if (null === match) {
                        match = normalizeText(text.trim()).match(/(.*)/)
                    }

                    if (null === match) {
                        console.log(normalizeText(text.trim()))
                    }

                    let elementType = match[1].trim()
                    let elementValue = Helper.isNotEmpty(match[2]) ? match[2] : null

                    switch (elementType) {
                    case 'Fire':
                        mapping[mappingKey].element.attack.type = 'fire'
                        mapping[mappingKey].element.attack.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Water':
                        mapping[mappingKey].element.attack.type = 'water'
                        mapping[mappingKey].element.attack.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Thunder':
                        mapping[mappingKey].element.attack.type = 'thunder'
                        mapping[mappingKey].element.attack.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Ice':
                        mapping[mappingKey].element.attack.type = 'ice'
                        mapping[mappingKey].element.attack.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Dragon':
                        mapping[mappingKey].element.attack.type = 'dragon'
                        mapping[mappingKey].element.attack.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Sleep':
                        mapping[mappingKey].element.status.type = 'sleep'
                        mapping[mappingKey].element.status.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Paralysis':
                        mapping[mappingKey].element.status.type = 'paralysis'
                        mapping[mappingKey].element.status.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Blast':
                        mapping[mappingKey].element.status.type = 'blast'
                        mapping[mappingKey].element.status.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    case 'Poison':
                        mapping[mappingKey].element.status.type = 'poison'
                        mapping[mappingKey].element.status.minValue = Helper.isNotEmpty(elementValue)
                            ? parseFloat(elementValue) : null

                        break
                    default:
                        console.log('no match property', normalizeText(text.trim()), match)

                        break
                    }
                })
            }

            if (Helper.isNotEmpty(sharpnessIndex)) {
                let sharpness = weaponNode.eq(sharpnessIndex).find('td').eq(1)
                let sharpnessList = [
                    'red',
                    'orange',
                    'yellow',
                    'green',
                    'blue',
                    'white',
                    'purple'
                ]

                sharpness.find('div.progress-bar').each((index, node) => {
                    let value = weaponDom(node).css('width').replace('%', '')

                    if ('' === value) {
                        return
                    }

                    value = parseFloat(value) * 4

                    if (0 === value) {
                        return
                    }

                    if (Helper.isEmpty(mapping[mappingKey].sharpness.minValue)) {
                        mapping[mappingKey].sharpness.minValue = 0
                    }

                    mapping[mappingKey].sharpness.minValue += value
                    mapping[mappingKey].sharpness.steps[sharpnessList[index]] = value
                })
            }

            // RampageSkill
            let rampageSkillLimit = weaponNode.eq(rampageSkillIndex).find('td').eq(1).text().trim()

            mapping[mappingKey].rampageSkill.amount = ('??' !== rampageSkillLimit && '--' !== rampageSkillLimit && '' !== rampageSkillLimit)
                ? parseFloat(rampageSkillLimit) : null

            let rampageSkillText = weaponNode.eq(rampageSkillIndex + 1).find('td').eq(1).html()

            if (-1 !== rampageSkillText.indexOf('<br>')
                && 'Plegis Needle I' !== name // Special Exception
                && 'Bolt Chamber II' !== name // Special Exception
                && 'Royal Bloom II' !== name // Special Exception
                && 'Wind Thief Crossbow I' !== name // Special Exception
                && 'Wind Thief Crossbow II' !== name // Special Exception
                && 'Wind Thief Crossbow III' !== name // Special Exception
                && 'Gale Crossbow' !== name // Special Exception
            ) {
                let rampageSkillSegments = rampageSkillText.split('<br>')

                rampageSkillSegments.forEach((node) => {
                    let name = normalizeText(weaponDom('<span>' + node + '</span>').text().trim())

                    if ('' === name) {
                        return
                    }

                    mapping[mappingKey].rampageSkill.list.push({
                        name: name
                    })
                })
            } else {
                weaponNode.eq(rampageSkillIndex + 1).find('td').eq(1).find('a').each((index, node) => {
                    let name = normalizeText(weaponDom(node).text().trim())

                    if ('' === name) {
                        return
                    }

                    mapping[mappingKey].rampageSkill.list.push({
                        name: name
                    })
                })
            }
        }

        let list = autoExtendListQuantity(Object.values(mapping))

        Helper.saveJSONAsCSV(`${tempRoot}/weapons/${weaponType}.csv`, list)
    }
}

export const fetchArmorsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.armors
    fetchPageName = 'armors'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('div.col-sm-3 h3.special + div.row a.wiki_link').length; rowIndex++) {
        let rowNode = listDom('div.col-sm-3 h3.special + div.row a.wiki_link').eq(rowIndex)

        let series = normalizeText(rowNode.text().trim())

        // Fetch Detail Page
        fetchPageUrl = urls.domain + rowNode.attr('href')
        fetchPageName = `armors:${series}`

        console.log(fetchPageUrl, fetchPageName)

        let armorDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

        if (Helper.isEmpty(armorDom)) {
            console.log(fetchPageUrl, fetchPageName, 'Err')

            return
        }

        let rare = normalizeText(armorDom('table.wiki_table').eq(0).find('tbody tr').eq(2).find('td').eq(1).text().trim()).replace('Rarity ', '')

        for (let rowIndex = 0; rowIndex < armorDom('table.wiki_table').eq(1).find('tbody tr').length; rowIndex++) {
            let rowNode = armorDom('table.wiki_table').eq(1).find('tbody tr').eq(rowIndex)

            if (0 === rowNode.find('td').eq(0).find('a').length) {
                continue
            }

            let name = rowNode.find('td').eq(0).find('a').text().trim()

            if ('No Helm' === name
                || 'No Chest' === name
                || 'No Arm' === name
                || 'No Arms' === name
                || 'No Waist' === name
                || 'No Leg' === name
                || 'No Legs' === name
            ) {
                continue
            }

            let minDefense = rowNode.find('td').eq(1).text().trim()
            let resistanceFire = rowNode.find('td').eq(3).text().trim()
            let resistanceWater = rowNode.find('td').eq(4).text().trim()
            let resistanceThunder = rowNode.find('td').eq(5).text().trim()
            let resistanceIce = rowNode.find('td').eq(6).text().trim()
            let resistanceDragon = rowNode.find('td').eq(7).text().trim()

            mappingKey = `${series}:${name}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultArmorItem)
            }

            mapping[mappingKey].series = {
                enUS: series
            }
            mapping[mappingKey].name = {
                enUS: name
            }
            mapping[mappingKey].gender = null
            mapping[mappingKey].rare = parseFloat(rare)
            mapping[mappingKey].minDefense = parseFloat(minDefense)
            mapping[mappingKey].resistance.fire = parseFloat(resistanceFire)
            mapping[mappingKey].resistance.water = parseFloat(resistanceWater)
            mapping[mappingKey].resistance.thunder = parseFloat(resistanceThunder)
            mapping[mappingKey].resistance.ice = parseFloat(resistanceIce)
            mapping[mappingKey].resistance.dragon = parseFloat(resistanceDragon)

            rowNode.find('td').eq(2).find('img').each((index, node) => {
                if ('/file/Monster-Hunter-Rise/gem_level_3_icon_monster_hunter_rise_wiki_guide_24px.png' === armorDom(node).attr('src')) {
                    mapping[mappingKey].slots.push({
                        size: 3
                    })
                } else if ('/file/Monster-Hunter-Rise/gem_level_2_icon_monster_hunter_rise_wiki_guide_24px.png' === armorDom(node).attr('src')) {
                    mapping[mappingKey].slots.push({
                        size: 2
                    })
                } else if ('/file/Monster-Hunter-Rise/gem_level_1_icon_monster_hunter_rise_wiki_guide_24px.png' === armorDom(node).attr('src')) {
                    mapping[mappingKey].slots.push({
                        size: 1
                    })
                }
            })

            let typeImgSrc = armorDom('table.wiki_table').eq(0).find('tbody tr').eq(7 + rowIndex).find('td').eq(0).find('img').attr('src')

            if ('/file/Monster-Hunter-Rise/helm-headgear-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'helm'
            } else if ('/file/Monster-Hunter-Rise/torso-chest-plate-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'chest'
            } else if ('/file/Monster-Hunter-Rise/arms-gauntlets-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'arm'
            } else if ('/file/Monster-Hunter-Rise/waist-belt-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'waist'
            } else if ('/file/Monster-Hunter-Rise/feet-boots-greaves-icon-monster-hunter-rise-wiki-guide.png' === typeImgSrc) {
                mapping[mappingKey].type = 'leg'
            }

            // Fetch Item Page
            fetchPageUrl = urls.domain + rowNode.find('td').eq(0).find('a').attr('href')
            fetchPageName = `armors:${series}:${name}`

            console.log(fetchPageUrl, fetchPageName)

            let itemDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

            if (Helper.isEmpty(itemDom)) {
                console.log(fetchPageUrl, fetchPageName, 'Err')

                return
            }

            // Skill
            let skillText = itemDom('table.wiki_table').eq(0).find('tbody tr').eq(11).find('td').eq(0).html()
            let skillSegments = (-1 !== skillText.indexOf(',')) ? skillText.split(',') : skillText.split('<br>')

            skillSegments.forEach((node) => {
                let tempText = normalizeText(itemDom(node).text().trim())
                let match = tempText.match(/^(.*?)x(\d)$/)

                if (Helper.isEmpty(match)) {
                    console.log(name, `<${tempText}>`)

                    return
                }

                mapping[mappingKey].skills.push({
                    name: match[1].trim(),
                    level: parseInt(match[2].trim())
                })
            })
        }
    }

    let list = autoExtendListQuantity(Object.values(mapping))

    Helper.saveJSONAsCSV(`${tempRoot}/armors.csv`, list)
}

export const fetchDecorationsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.decorations
    fetchPageName = 'decorations'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('table.wiki_table tbody tr').length; rowIndex++) {
        let rowNode = listDom('table.wiki_table tbody tr').eq(rowIndex)

        // Get Data
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim()).match(/^(.*?) \d$/)[1]
        let size = rowNode.find('td').eq(1).text().trim().match(/^\((\d)\)$/)[1]
        let rare = rowNode.find('td').eq(2).text().trim().replace('Rarity ', '')
        let skillName = normalizeText(rowNode.find('td').eq(3).find('a').text().trim())

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultDecorationItem)
        }

        mapping[mappingKey].name = {
            enUS: name
        }
        mapping[mappingKey].rare = parseFloat(rare)
        mapping[mappingKey].size = parseFloat(size)
        mapping[mappingKey].skills.push({
            name: skillName,
            level: 1
        })
    }

    Helper.saveJSONAsCSV(`${tempRoot}/decorations.csv`, Object.values(mapping))
}

export const fetchRampageSkillsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.rampageSkills
    fetchPageName = 'rampageSkills'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('table.wiki_table tbody tr').length; rowIndex++) {
        let rowNode = listDom('table.wiki_table tbody tr').eq(rowIndex)

        // Get Data
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
        let description = rowNode.find('td').eq(1).text().trim()

        mappingKey = name

        if (Helper.isEmpty(mapping[mappingKey])) {
            mapping[mappingKey] = Helper.deepCopy(defaultRampageSkillItem)
        }

        mapping[mappingKey].name = {
            enUS: name
        }
        mapping[mappingKey].description = {
            enUS: description
        }
    }

    Helper.saveJSONAsCSV(`${tempRoot}/rampageSkills.csv`, Object.values(mapping))
}

export const fetchSkillsAction = async () => {
    let fetchPageUrl = null
    let fetchPageName = null

    let mapping = {}
    let mappingKey = null

    // Fetch List Page
    fetchPageUrl = urls.skills
    fetchPageName = 'skills'

    console.log(fetchPageUrl, fetchPageName)

    let listDom = await Helper.fetchHtmlAsDom(fetchPageUrl)

    if (Helper.isEmpty(listDom)) {
        console.log(fetchPageUrl, fetchPageName, 'Err')

        return
    }

    for (let rowIndex = 0; rowIndex < listDom('table.wiki_table tbody tr').length; rowIndex++) {
        let rowNode = listDom('table.wiki_table tbody tr').eq(rowIndex)

        // Get Data
        let name = normalizeText(rowNode.find('td').eq(0).find('a').text().trim())
        let description = rowNode.find('td').eq(1).text().trim()

        for (let skillIndex = 0; skillIndex < rowNode.find('td').eq(3).find('li').length; skillIndex++) {
            let skillNode = rowNode.find('td').eq(3).find('li').eq(skillIndex)

            // Get Data
            let tempText = normalizeText(skillNode.text().trim())

            let level = tempText.match(/^Level (\d)\: (.*?)$/)[1]
            let effect = normalizeText(tempText.match(/^Level (\d)\: (.*?)$/)[2])

            mappingKey = `${name}:${level}`

            if (Helper.isEmpty(mapping[mappingKey])) {
                mapping[mappingKey] = Helper.deepCopy(defaultSkillItem)
            }

            mapping[mappingKey].name = {
                enUS: name
            }
            mapping[mappingKey].description = {
                enUS: description
            }
            mapping[mappingKey].level = parseFloat(level)
            mapping[mappingKey].effect = {
                enUS: effect
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
        decorations: {},
        skills: {},
        rampageDecorations: {},
        rampageSkills: {}
    }

    result.weapons.all = 0
    result.armors.all = 0
    result.decorations.all = 0
    result.rampageDecorations.all = 0

    for (let weaponType of weaponTypeList) {
        result.weapons[weaponType] = {}
        result.weapons[weaponType].all = 0

        for (let rare of rareList) {
            result.weapons[weaponType][rare] = 0
        }
    }

    for (let rare of rareList) {
        result.armors[rare] = 0
    }

    for (let size of sizeList) {
        result.decorations[size] = 0
        result.rampageDecorations[size] = 0
    }

    // Weapons
    for (let weaponType of weaponTypeList) {
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
    let armorList = Helper.loadCSVAsJSON(`${tempRoot}/armors.csv`)

    if (Helper.isNotEmpty(armorList)) {
        result.armors.all = armorList.length

        for (let item of armorList) {
            if (Helper.isNotEmpty(item.rare)) {
                result.armors[`rare${item.rare}`] += 1
            }
        }
    }

    // Decorations
    let decorationList = Helper.loadCSVAsJSON(`${tempRoot}/decorations.csv`)

    if (Helper.isNotEmpty(decorationList)) {
        result.decorations.all = decorationList.length

        for (let item of decorationList) {
            if (Helper.isNotEmpty(item.size)) {
                result.decorations[`size${item.size}`] += 1
            }
        }
    }

    // RampageSkills & Skills
    for (let target of ['rampageSkills', 'skills']) {
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
        fetchDecorationsAction(),
        fetchRampageSkillsAction(),
        fetchSkillsAction()
    ]).then(() => {
        infoAction()
    })
}

export default {
    fetchAllAction,
    fetchWeaponsAction,
    fetchArmorsAction,
    fetchDecorationsAction,
    fetchRampageSkillsAction,
    fetchSkillsAction,
    infoAction
}
