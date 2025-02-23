/**
 * Fitting Algorithm
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import MD5 from 'md5'

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/world/misc'
import WeaponDataset from '@/scripts/libraries/world/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import SetDataset from '@/scripts/libraries/world/dataset/set'
import DecorationDataset from '@/scripts/libraries/world/dataset/decoration'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'

/**
 * Variables
 */
const defaultBundle = {
    equipIdMapping: {
        weapon: null,
        helm: null,
        chest: null,
        arm: null,
        waist: null,
        leg: null,
        charm: null
    },
    skillLevelMapping: {},
    setCountMapping: {},
    slotCountMapping: {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    },
    decorationPackages: [],
    meta: {
        equipCount: 0,
        defense: 0,
        resistance: {
            fire: 0,
            water: 0,
            thunder: 0,
            ice: 0,
            dragon: 0
        },
        completedSkills: {},
        completedSets: {},
        remainingSlotCountMapping: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            all: 0
        },
        totalExpectedValue: 0,
        totalExpectedLevel: 0,
        skillExpectedValue: 0,
        skillExpectedLevel: 0
    }
}

const defaultCandidateEquipItem = {
    id: null,
    type: null,
    defense: 0,
    resistance: {
        fire: 0,
        water: 0,
        thunder: 0,
        ice: 0,
        dragon: 0
    },
    skillLevelMapping: {},
    setId: null,
    slotCountMapping: {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    },
    totalExpectedValue: 0,
    totalExpectedLevel: 0,
    skillExpectedValue: 0,
    skillExpectedLevel: 0
}

class FittingAlgorithm {

    /**
     * Search
     */
    search = (requiredConditions, algorithmParams, callback) => {
        if (0 === requiredConditions.sets.length && 0 === requiredConditions.skills.length) {
            return []
        }

        Helper.log('FA: Input: Required Equips', requiredConditions.equips)
        Helper.log('FA: Input: Required Sets', requiredConditions.sets)
        Helper.log('FA: Input: Required Skills', requiredConditions.skills)
        Helper.log('FA: Input: Algorithm Params', algorithmParams)

        // Set Properties
        this.algorithmParams = Helper.deepCopy(algorithmParams)
        this.callback = callback

        this.currentEquipTypes = []
        this.currentSetMapping = {}
        this.currentSkillMapping = {}
        this.currentSlotMapping = {
            1: { expectedValue: 0, expectedLevel: 0 },
            2: { expectedValue: 0, expectedLevel: 0 },
            3: { expectedValue: 0, expectedLevel: 0 },
            4: { expectedValue: 0, expectedLevel: 0 }
        }
        this.totalExpectedValue = 0
        this.totalExpectedLevel = 0

        this.correspondDecorations = {}
        this.firstBundle = {}
        this.usedEquipIds = {}

        this.equipMaxExpectedValue = {}
        this.equipMaxExpectedLevel = {}
        this.equipFutureExpectedValue = {}
        this.equipFutureExpectedLevel = {}

        // Init Condtions
        this.isInitFailed = false

        this.initialize(requiredConditions, algorithmParams)

        if (this.isInitFailed) {
            Helper.log('FA: Init: Failed')

            return []
        }

        this.currentEquipCount = this.currentEquipTypes.length
        this.currentSetCount = Object.keys(this.currentSetMapping).length
        this.currentSkillCount = Object.keys(this.currentSkillMapping).length

        // Print Init
        Helper.log('FA: Global: Current Equip Types:', this.currentEquipTypes)
        Helper.log('FA: Global: Current Set Mapping:', this.currentSetMapping)
        Helper.log('FA: Global: Current Skill Mapping:', this.currentSkillMapping)
        Helper.log('FA: Global: Current Slot Mapping:', this.currentSlotMapping)
        Helper.log('FA: Global: Correspond Decorations:', this.correspondDecorations)
        Helper.log('FA: Global: Total Expected Value:', this.totalExpectedValue)
        Helper.log('FA: Global: Total Expected Level:', this.totalExpectedLevel)
        Helper.log('FA: Global: First Bundle:', this.firstBundle)

        if (0 === this.currentSetCount && 0 === this.currentSkillCount) {
            return []
        }

        // Save StartTime
        this.startTime = parseInt(Math.floor(Date.now() / 1000), 10)

        // Create Bundles with Equips
        let bundleList = this.createBundleListWithEquips(this.firstBundle)

        this.callback({
            bundleCount: bundleList.length,
            searchPercent: 100,
            timeRemaining: 0
        })

        // Sort Bundle List & Clean up
        return this.sortBundleList(bundleList).map((bundle) => {
            Object.keys(bundle.equipIdMapping).forEach((equipType) => {
                if ('empty' + Helper.ucfirst(equipType) === bundle.equipIdMapping[equipType]) {
                    bundle.equipIdMapping[equipType] = null
                }
            })

            delete bundle.meta.completedSets
            delete bundle.meta.completedSkills
            delete bundle.meta.remainingSlotCountMapping
            delete bundle.meta.totalExpectedValue
            delete bundle.meta.totalExpectedLevel
            delete bundle.meta.skillExpectedValue
            delete bundle.meta.skillExpectedLevel

            bundle.hash = this.getBundleHash(bundle)

            return bundle
        })
    }

    /**
     * Generate Bundle Hash
     */
    getBundleHash = (bundle) => {
        let equipMapping = {}

        Object.keys(bundle.equipIdMapping).forEach((equipType) => {
            if (Helper.isEmpty(bundle.equipIdMapping[equipType])) {
                return
            }

            equipMapping[equipType] = bundle.equipIdMapping[equipType]
        })

        return MD5(JSON.stringify(equipMapping))
    }

    /**
     * Generate Bundle Decoration Hash
     */
    getBundleDecorationHash = (bundle) => {
        let decorationMapping = {}

        Object.keys(bundle.decorationMapping).sort().forEach((decorationId) => {
            if (0 === bundle.decorationMapping[decorationId]) {
                return
            }

            decorationMapping[decorationId] = bundle.decorationMapping[decorationId]
        })

        return MD5(JSON.stringify(decorationMapping))
    }

    initialize = (requiredConditions, algorithmParams) => {
        // Init Condition Skills
        let requiredSkillIds = []

        requiredConditions.skills.sort((skillA, skillB) => {
            return skillB.level - skillA.level
        }).forEach((skill) => {
            this.currentSkillMapping[skill.id] = {
                level: skill.level,
                decorationSize: 0
            }

            if (0 === this.currentSkillMapping[skill.id].level) {
                return
            }

            requiredSkillIds.push(skill.id)

            DecorationDataset.hasSkill(skill.id).getItems().forEach((decorationInfo) => {
                if (4 === decorationInfo.size) {
                    return
                }

                this.currentSkillMapping[skill.id].decorationSize = decorationInfo.size
            })

            // Increase Expected Value & Level
            this.totalExpectedValue += skill.level * this.currentSkillMapping[skill.id].decorationSize
            this.totalExpectedLevel += skill.level
        })

        DecorationDataset.hasSkills(requiredSkillIds, true).getItems().forEach((decorationInfo) => {
            let isSkip = false

            decorationInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === this.currentSkillMapping[skill.id].level) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            // Check is Using Factor Decoration
            if (false === this.algorithmParams.usingFactor.decoration['size' + decorationInfo.size]) {
                return
            }

            if (Helper.isEmpty(this.algorithmParams.usingFactor.decoration[decorationInfo.id])) {
                this.algorithmParams.usingFactor.decoration[decorationInfo.id] = -1
            }

            if (0 === this.algorithmParams.usingFactor.decoration[decorationInfo.id]) {
                return
            }

            // Create Infos
            let expectedValue = 0
            let expectedLevel = 0

            let decorationSkills = decorationInfo.skills.map((skill) => {
                expectedValue += skill.level * this.currentSkillMapping[skill.id].decorationSize
                expectedLevel += skill.level

                return {
                    id: skill.id,
                    level: skill.level
                }
            })

            if (this.currentSlotMapping[decorationInfo.size].expectedValue < expectedValue) {
                this.currentSlotMapping[decorationInfo.size].expectedValue = expectedValue
            }

            if (this.currentSlotMapping[decorationInfo.size].expectedLevel < expectedLevel) {
                this.currentSlotMapping[decorationInfo.size].expectedLevel = expectedLevel
            }

            if (Helper.isEmpty(this.correspondDecorations[decorationInfo.size])) {
                this.correspondDecorations[decorationInfo.size] = []
            }

            let decorationCountLimit = null

            if (-1 !== this.algorithmParams.usingFactor.decoration[decorationInfo.id]) {
                decorationCountLimit = this.algorithmParams.usingFactor.decoration[decorationInfo.id]
            }

            this.correspondDecorations[decorationInfo.size].push({
                id: decorationInfo.id,
                size: decorationInfo.size,
                skills: decorationSkills,
                countLimit: decorationCountLimit,
                expectedValue: expectedValue,
                expectedLevel: expectedLevel
            })
        })

        Object.keys(this.currentSlotMapping).forEach((size) => {
            if (1 === size) {
                return
            }

            if (Helper.isNotEmpty(this.currentSlotMapping[size])) {
                return
            }

            this.currentSlotMapping[size] = this.currentSlotMapping[size - 1]
        })

        // Init Condition Sets
        requiredConditions.sets.sort((setA, setB) => {
            let setInfoA = SetDataset.getInfo(setA.id)
            let setInfoB = SetDataset.getInfo(setB.id)

            if (Helper.isEmpty(setInfoA) || Helper.isEmpty(setInfoB)) {
                return 0
            }

            return setInfoB.skills.pop().require - setInfoA.skills.pop().require
        }).forEach((set) => {
            let setInfo = SetDataset.getInfo(set.id)

            if (Helper.isEmpty(setInfo)) {
                return
            }

            this.currentSetMapping[set.id] = {
                require: setInfo.skills[set.step - 1].require
            }
        })

        // Init Condition Equips
        let bundle = Helper.deepCopy(defaultBundle)

        // Create First Bundle
        for (let equipType of ['weapon', 'helm', 'chest', 'arm', 'waist', 'leg', 'charm']) {
            if (this.isInitFailed) {
                continue
            }

            if (Helper.isEmpty(requiredConditions.equips[equipType])) {
                if ('weapon' !== equipType) {
                    this.currentEquipTypes.push(equipType)
                }

                continue
            }

            // Get Equip Info
            let equipInfo = null

            if ('weapon' === equipType) {

                // Set Custom Weapon
                if (Helper.isNotEmpty(requiredConditions.equips.weapon.customWeapon)) {
                    let customWeapon = requiredConditions.equips.weapon.customWeapon
                    let isCompleted = true

                    if (Helper.isEmpty(customWeapon.type)
                        || Helper.isEmpty(customWeapon.rare)
                        || Helper.isEmpty(customWeapon.attack)
                        || Helper.isEmpty(customWeapon.criticalRate)
                        || Helper.isEmpty(customWeapon.defense)
                    ) {
                        isCompleted = false
                    }

                    if (Helper.isNotEmpty(customWeapon.element.attack)
                        && Helper.isEmpty(customWeapon.element.attack.minValue)
                    ) {
                        isCompleted = false
                    }

                    if (Helper.isNotEmpty(customWeapon.element.status)
                        && Helper.isEmpty(customWeapon.element.status.minValue)
                    ) {
                        isCompleted = false
                    }

                    WeaponDataset.setInfo('customWeapon', (true === isCompleted)
                        ? Helper.deepCopy(customWeapon) : null)

                    Helper.log('FA: Input: Custom Weapon', customWeapon)
                }

                equipInfo = Misc.getAppliedWeaponInfo(requiredConditions.equips.weapon)
            } else if ('helm' === equipType
                || 'chest' === equipType
                || 'arm' === equipType
                || 'waist' === equipType
                || 'leg' === equipType
            ) {
                equipInfo = Misc.getAppliedArmorInfo(requiredConditions.equips[equipType])
            } else if ('charm' === equipType) {
                equipInfo = Misc.getAppliedCharmInfo(requiredConditions.equips.charm)
            }

            // Check Equip Info
            if (Helper.isEmpty(equipInfo)) {
                continue
            }

            // Convert Equip to Candidate Equip
            let candidateEquip = this.convertEquipInfoToCandidateEquip(equipInfo, equipType)

            if (false === candidateEquip) {
                continue
            }

            // Set Used Candidate Equip
            this.usedEquipIds[candidateEquip.id] = true

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquip)

            if (false === bundle) {
                this.isInitFailed = true

                continue
            }
        }

        if (this.isInitFailed) {
            return
        }

        // Reset Equip Count
        bundle.meta.equipCount = 0

        Object.keys(this.currentSkillMapping).forEach((skillId) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillId])) {
                bundle.skillLevelMapping[skillId] = 0
            }
        })

        this.firstBundle = bundle
    }

    /**
     * Create Bundle List with Equips
     */
    createBundleListWithEquips = (bundle) => {
        let candidateEquipPool = {}
        let lastBundleMapping = {}

        this.currentEquipTypes.forEach((equipType) => {
            if (Helper.isEmpty(candidateEquipPool[equipType])) {
                candidateEquipPool[equipType] = {}
            }

            // Create Set Equips
            Object.keys(this.currentSetMapping).forEach((setId) => {
                let equipInfos = ArmorDataset.typeIs(equipType).setIs(setId).getItems()

                // Merge Candidate Equips
                candidateEquipPool[equipType] = Object.assign(
                    candidateEquipPool[equipType],
                    this.createCandidateEquips(equipInfos, equipType)
                )
            })

            // Create Skill Equips
            Object.keys(this.currentSkillMapping).forEach((skillId) => {
                let equipInfos = null

                if ('helm' === equipType
                    || 'chest' === equipType
                    || 'arm' === equipType
                    || 'waist' === equipType
                    || 'leg' === equipType
                ) {
                    equipInfos = ArmorDataset.typeIs(equipType).hasSkill(skillId).getItems()
                } else if ('charm' === equipType) {
                    equipInfos = CharmDataset.hasSkill(skillId).getItems()
                }

                // Merge Candidate Equips
                candidateEquipPool[equipType] = Object.assign(
                    candidateEquipPool[equipType],
                    this.createCandidateEquips(equipInfos, equipType)
                )

                if ('charm' !== equipType) {
                    equipInfos = ArmorDataset.typeIs(equipType).rareIs(0).getItems()

                    // Merge Candidate Equips
                    candidateEquipPool[equipType] = Object.assign(
                        candidateEquipPool[equipType],
                        this.createCandidateEquips(equipInfos, equipType)
                    )
                }
            })

            // Append Empty Candidate Equip
            candidateEquipPool[equipType]['empty' + Helper.ucfirst(equipType)] = this.getEmptyCandidateEquip(equipType)

            Helper.log('FA: Candidate Equip Pool:', equipType, Object.keys(candidateEquipPool[equipType]).length, candidateEquipPool[equipType])
        })

        // Create Current Equip Types and Convert Candidate Equip Pool
        // Create Equip Max Expected Value & Expected Level
        let currentEquipTypes = []
        let traversalCount = 0
        let traversalPercent = 0
        let totalTraversalCount = 1

        for (const [equipType, candidateEquips] of Object.entries(candidateEquipPool)) {
            if (Helper.isEmpty(this.equipMaxExpectedValue[equipType])) {
                this.equipMaxExpectedValue[equipType] = 0
            }

            if (Helper.isEmpty(this.equipMaxExpectedLevel[equipType])) {
                this.equipMaxExpectedLevel[equipType] = 0
            }

            Object.values(candidateEquips).forEach((candidateEquip) => {
                if (this.equipMaxExpectedValue[equipType] < candidateEquip.totalExpectedValue) {
                    this.equipMaxExpectedValue[equipType] = candidateEquip.totalExpectedValue
                }

                if (this.equipMaxExpectedLevel[equipType] < candidateEquip.totalExpectedLevel) {
                    this.equipMaxExpectedLevel[equipType] = candidateEquip.totalExpectedLevel
                }
            })

            currentEquipTypes.push(equipType)
            candidateEquipPool[equipType] = Object.values(candidateEquips)
            totalTraversalCount *= candidateEquipPool[equipType].length
        }

        candidateEquipPool = Object.values(candidateEquipPool)

        let candidateEquipPoolCount = candidateEquipPool.map((equips) => {
            return equips.length
        })

        Helper.log('FA: Global: Equip Max Expected Value:', this.equipMaxExpectedValue)
        Helper.log('FA: Global: Equip Max Expected Level:', this.equipMaxExpectedLevel)

        // Create Equip Future Expected Value & Expected Level
        currentEquipTypes.forEach((equipTypeA, typeIndex) => {
            this.equipFutureExpectedValue[equipTypeA] = 0
            this.equipFutureExpectedLevel[equipTypeA] = 0

            currentEquipTypes.forEach((equipTypeB) => {
                if (-1 !== currentEquipTypes.slice(0, typeIndex +1).indexOf(equipTypeB)) {
                    return
                }

                this.equipFutureExpectedValue[equipTypeA] += this.equipMaxExpectedValue[equipTypeB]
                this.equipFutureExpectedLevel[equipTypeA] += this.equipMaxExpectedLevel[equipTypeB]
            })
        })

        Helper.log('FA: Global: Equip Future Expected Value:', this.equipFutureExpectedValue)
        Helper.log('FA: Global: Equip Future Expected Level:', this.equipFutureExpectedLevel)

        // Special Case: 1
        if (1 === totalTraversalCount) {
            if (0 < this.currentSkillCount
                && false === this.isBundleSkillsCompleted(bundle)
            ) {
                let tempBundle = this.createBundleWithDecorations(bundle)

                if (false !== tempBundle) {
                    lastBundleMapping[this.getBundleHash(tempBundle)] = tempBundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })
                }
            }

            return Object.values(lastBundleMapping)
        }

        // Special Case: 2
        if (0 < this.currentSetCount && this.isBundleSetsCompleted(bundle)) {
            if ( 0 < this.currentSkillCount
                && false === this.isBundleSkillsCompleted(bundle)
            ) {
                // Create Bundle With Decorations
                let tempBundle = this.createBundleWithDecorations(bundle)

                if (false !== tempBundle) {
                    lastBundleMapping[this.getBundleHash(tempBundle)] = tempBundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })
                }
            }
        }

        let stackIndex = 0
        let statusStack = []
        let typeIndex = null
        let equipIndex = null
        let candidateEquip = null

        // Push Root Bundle
        statusStack.push({
            bundle: bundle,
            typeIndex: 0,
            equipIndex: 0
        })

        const calculateTraversalCount = () => {
            traversalCount = 1

            candidateEquipPoolCount.forEach((equipCount, index) => {
                traversalCount *= (index <= stackIndex)
                    ? statusStack[index].equipIndex + 1 : equipCount
            })

            let precent = traversalCount / totalTraversalCount

            if (parseInt(precent * 100) <= traversalPercent) {
                return
            }

            traversalPercent = parseInt(precent * 100)

            // Helper.log('FA: Skill Equips: Traversal Count:', traversalCount)

            let diffTime = parseInt(Math.floor(Date.now() / 1000), 10) - this.startTime

            this.callback({
                searchPercent: traversalPercent,
                timeRemaining: parseInt(diffTime / precent - diffTime)
            })
        }

        const findPrevTypeAndNextEquip = () => {
            while (true) {
                stackIndex--
                statusStack.pop()

                if (0 === statusStack.length) {
                    break
                }

                typeIndex = statusStack[stackIndex].typeIndex
                equipIndex = statusStack[stackIndex].equipIndex

                if (Helper.isNotEmpty(candidateEquipPool[typeIndex][equipIndex + 1])) {
                    statusStack[typeIndex].equipIndex++

                    calculateTraversalCount()

                    break
                }
            }
        }

        const findNextEquip = () => {
            typeIndex = statusStack[stackIndex].typeIndex

            if (Helper.isNotEmpty(candidateEquipPool[typeIndex][equipIndex + 1])) {
                statusStack[stackIndex].equipIndex++

                calculateTraversalCount()
            } else {
                findPrevTypeAndNextEquip()
            }
        }

        const findNextType = () => {
            typeIndex = statusStack[stackIndex].typeIndex

            if (Helper.isNotEmpty(candidateEquipPool[typeIndex + 1])) {
                stackIndex++
                statusStack.push({
                    bundle: bundle,
                    typeIndex: typeIndex + 1,
                    equipIndex: 0
                })
            } else {
                findNextEquip()
            }
        }

        // Helper.log('FA: CreateBundlesWithEquips: Root Bundle:', bundle)

        while (true) {
            if (0 === statusStack.length) {
                break
            }

            bundle = statusStack[stackIndex].bundle
            typeIndex = statusStack[stackIndex].typeIndex
            equipIndex = statusStack[stackIndex].equipIndex
            candidateEquip = candidateEquipPool[typeIndex][equipIndex]

            // Add Candidate Equip to Bundle
            bundle = this.addCandidateEquipToBundle(bundle, candidateEquip)

            // If Add Candidate Equip Failed
            if (false === bundle) {
                findNextEquip()

                continue
            }

            // Check Bundle Sets
            if (this.isBundleSetsCompleted(bundle)) {

                // Check Bundle Skills
                if (this.isBundleSkillsCompleted(bundle)) {
                    lastBundleMapping[this.getBundleHash(bundle)] = bundle

                    this.callback({
                        bundleCount: Object.keys(lastBundleMapping).length
                    })

                    Helper.log('FA: Last Bundle Count:', Object.keys(lastBundleMapping).length)

                    if (this.algorithmParams.limit <= Object.keys(lastBundleMapping).length) {
                        break
                    }

                    findNextEquip()

                    continue
                }

                // Check Bundle Reach Expected
                if (this.isBundleReachExpected(bundle)) {

                    // Create Bundle With Decorations
                    bundle = this.createBundleWithDecorations(bundle)

                    if (false !== bundle) {
                        lastBundleMapping[this.getBundleHash(bundle)] = bundle

                        this.callback({
                            bundleCount: Object.keys(lastBundleMapping).length
                        })

                        Helper.log('FA: Last Bundle Count:', Object.keys(lastBundleMapping).length)

                        if (this.algorithmParams.limit <= Object.keys(lastBundleMapping).length) {
                            break
                        }
                    }

                    findNextEquip()

                    continue
                }

                // Check Bundle Have a Future
                if (false === this.isBundleHaveFuture(bundle, currentEquipTypes[typeIndex])) {
                    findNextEquip()

                    continue
                }
            }

            findNextType()
        }

        calculateTraversalCount()

        Helper.log('FA: Last Bundle Result:', lastBundleMapping)

        return Object.values(lastBundleMapping)
    }

    createBundleWithDecorations = (bundle) => {
        if (this.isBundleSkillsCompleted(bundle)) {
            return bundle
        }

        if (0 === bundle.meta.remainingSlotCountMapping.all) {
            return false
        }

        let lastBundle = null
        let decorationPackageMapping = []

        // Create Current Skill Ids and Convert Correspond Decoration Pool
        let correspondDecorationPool = {}
        let slotMapping = {}

        for (let size of [ 1, 2, 3, 4 ]) {
            correspondDecorationPool[size] = Helper.isNotEmpty(this.correspondDecorations[size])
                ? this.correspondDecorations[size] : []
            slotMapping[size] = null

            correspondDecorationPool[size] = correspondDecorationPool[size].filter((decoration) => {
                let isSkip = false

                decoration.skills.forEach((skill) => {
                    if (true === isSkip) {
                        return
                    }

                    if (Helper.isNotEmpty(bundle.meta.completedSkills[skill.id])) {
                        isSkip = true

                        return
                    }
                })

                if (true === isSkip) {
                    return false
                }

                if (Helper.isEmpty(slotMapping[size])) {
                    slotMapping[size] = {
                        expectedValue: 0,
                        expectedLevel: 0
                    }
                }

                if (slotMapping[size].expectedValue < decoration.expectedValue) {
                    slotMapping[size].expectedValue = decoration.expectedValue
                }

                if (slotMapping[size].expectedLevel < decoration.expectedLevel) {
                    slotMapping[size].expectedLevel = decoration.expectedLevel
                }

                return true
            })

            if (Helper.isEmpty(slotMapping[size]) && Helper.isNotEmpty(slotMapping[size - 1])) {
                slotMapping[size] = slotMapping[size - 1]
            }

            if (Helper.isEmpty(slotMapping[size])) {
                slotMapping[size] = {
                    expectedValue: 0,
                    expectedLevel: 0
                }
            }

            if (Helper.isNotEmpty(correspondDecorationPool[size - 1])) {
                correspondDecorationPool[size] = correspondDecorationPool[size].concat(correspondDecorationPool[size - 1])
            }
        }

        let slotSizeList = []

        for (let size = 4; size > 0; size--) {
            if (0 === bundle.meta.remainingSlotCountMapping[size]) {
                continue
            }

            for (let index = 0; index < bundle.meta.remainingSlotCountMapping[size]; index++) {
                slotSizeList.push(size)
            }
        }

        let stackIndex = 0
        let statusStack = []
        let slotIndex = null
        let slotSize = null
        let decorationIndex = null
        let correspondDecoration = null

        // Push Root Bundle
        statusStack.push({
            bundle: bundle,
            slotIndex: 0,
            decorationIndex: 0
        })

        const findPrevSkillAndNextDecoration = () => {
            while (true) {
                stackIndex--
                statusStack.pop()

                if (0 === statusStack.length) {
                    break
                }

                slotIndex = statusStack[stackIndex].slotIndex
                slotSize = slotSizeList[slotIndex]
                decorationIndex = statusStack[stackIndex].decorationIndex

                if (Helper.isNotEmpty(correspondDecorationPool[slotSize][decorationIndex + 1])) {
                    statusStack[stackIndex].decorationIndex++

                    break
                }
            }
        }

        const findNextDecoration = () => {
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            decorationIndex = statusStack[stackIndex].decorationIndex

            if (Helper.isNotEmpty(correspondDecorationPool[slotSize][decorationIndex + 1])) {
                statusStack[stackIndex].decorationIndex++
            } else {
                findPrevSkillAndNextDecoration()
            }
        }

        const findNextSlot = () => {
            slotIndex = statusStack[stackIndex].slotIndex

            if (Helper.isNotEmpty(slotSizeList[slotIndex + 1])) {
                stackIndex++
                statusStack.push({
                    bundle: bundle,
                    slotIndex: slotIndex + 1,
                    decorationIndex: 0
                })
            } else {
                findNextDecoration()
            }
        }

        // Helper.log('FA: CreateBundlesWithDecorations: Root Bundle:', bundle)

        while (true) {
            if (0 === statusStack.length) {
                break
            }

            bundle = statusStack[stackIndex].bundle
            slotIndex = statusStack[stackIndex].slotIndex
            slotSize = slotSizeList[slotIndex]
            decorationIndex = statusStack[stackIndex].decorationIndex
            correspondDecoration = correspondDecorationPool[slotSize][decorationIndex]

            if (0 === bundle.meta.remainingSlotCountMapping.all) {
                findPrevSkillAndNextDecoration()

                continue
            }

            if (0 === bundle.meta.remainingSlotCountMapping[slotSize]) {
                findNextSlot()

                continue
            }

            // Add Decoration To Bundle
            bundle = this.addDecorationToBundle(bundle, slotSize, correspondDecoration, true)

            if (false === bundle) {
                findNextDecoration()

                continue
            }

            // Check Bundle Skills
            if (this.isBundleSkillsCompleted(bundle)) {
                if (Helper.isEmpty(lastBundle)) {
                    lastBundle = Helper.deepCopy(bundle)

                    delete lastBundle.decorationMapping
                }

                decorationPackageMapping[this.getBundleDecorationHash(bundle)] = bundle.decorationMapping

                // Helper.log('FA: Last Package Count:', Object.keys(decorationPackageMapping).length)

                findPrevSkillAndNextDecoration()

                continue
            }

            // Check Bundle Decoration Have a Future
            if (false === this.isBundleDecorationHaveFuture(bundle, slotMapping)) {
                findNextDecoration()

                continue
            }

            findNextSlot()
        }

        if (Helper.isEmpty(lastBundle)) {
            return false
        }

        // Replace Decoration Packages
        lastBundle.decorationPackages = Object.values(decorationPackageMapping)

        return lastBundle
    }

    /**
     * Create Sorted Bundle List
     */
    sortBundleList = (bundleList) => {
        switch (this.algorithmParams.sort) {
        case 'complex':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = (8 - bundleA.meta.equipCount) * 1000 + bundleA.meta.defense
                let valueB = (8 - bundleB.meta.equipCount) * 1000 + bundleB.meta.defense

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: (8 - bundle.meta.equipCount) * 1000 + bundle.meta.defense
                }

                return bundle
            })
        case 'amount':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.equipCount
                let valueB = bundleB.meta.equipCount

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: bundle.meta.equipCount
                }

                return bundle
            })
        case 'defense':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.defense
                let valueB = bundleB.meta.defense

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: bundle.meta.defense
                }

                return bundle
            })
        case 'fire':
        case 'water':
        case 'thunder':
        case 'ice':
        case 'dragon':
            return bundleList.sort((bundleA, bundleB) => {
                let valueA = bundleA.meta.resistance[this.algorithmParams.sort]
                let valueB = bundleB.meta.resistance[this.algorithmParams.sort]

                return ('asc' === this.algorithmParams.order)
                    ? (valueA - valueB) : (valueB - valueA)
            }).map((bundle) => {
                bundle.meta.sortBy = {
                    key: this.algorithmParams.sort,
                    value: bundle.meta.resistance[this.algorithmParams.sort]
                }

                return bundle
            })
        default:
            return bundleList
        }
    }

    /**
     * Add Candidate Equip To Bundle
     */
    addCandidateEquipToBundle = (bundle, candidateEquip) => {
        if (Helper.isEmpty(candidateEquip.id)) {
            return false
        }

        if (Helper.isNotEmpty(bundle.equipIdMapping[candidateEquip.type])) {
            return false
        }

        bundle = Helper.deepCopy(bundle)
        bundle.equipIdMapping[candidateEquip.type] = candidateEquip.id

        // Increase Skill Level
        let isSkillLevelOverflow = false

        Object.keys(candidateEquip.skillLevelMapping).forEach((skillId) => {
            if (Helper.isEmpty(bundle.skillLevelMapping[skillId])) {
                bundle.skillLevelMapping[skillId] = 0
            }

            bundle.skillLevelMapping[skillId] += candidateEquip.skillLevelMapping[skillId]

            if (Helper.isNotEmpty(this.currentSkillMapping[skillId])) {
                if (this.currentSkillMapping[skillId].level < bundle.skillLevelMapping[skillId]) {
                    isSkillLevelOverflow = true
                }

                if (this.currentSkillMapping[skillId].level === bundle.skillLevelMapping[skillId]) {
                    bundle.meta.completedSkills[skillId] = true
                }
            }
        })

        if (true === isSkillLevelOverflow) {
            return false
        }

        // Increase Set Count
        let isSetRequireOverflow = false

        if (Helper.isNotEmpty(candidateEquip.setId)) {
            if (Helper.isEmpty(bundle.setCountMapping[candidateEquip.setId])) {
                bundle.setCountMapping[candidateEquip.setId] = 0
            }

            bundle.setCountMapping[candidateEquip.setId] += 1

            if (Helper.isNotEmpty(this.currentSetMapping[candidateEquip.setId])) {
                if (this.currentSetMapping[candidateEquip.setId].require < bundle.setCountMapping[candidateEquip.setId]) {
                    isSetRequireOverflow = true
                }

                if (this.currentSetMapping[candidateEquip.setId].require === bundle.setCountMapping[candidateEquip.setId]) {
                    bundle.meta.completedSets[candidateEquip.setId] = true
                }
            }
        }

        if (true === isSetRequireOverflow) {
            return false
        }

        // Increase Slot Count
        for (let size = 1; size <= 4; size++) {
            bundle.slotCountMapping[size] += candidateEquip.slotCountMapping[size]

            bundle.meta.remainingSlotCountMapping[size] += candidateEquip.slotCountMapping[size]
            bundle.meta.remainingSlotCountMapping.all += candidateEquip.slotCountMapping[size]
        }

        // Increase Defense & Resistances
        bundle.meta.defense += candidateEquip.defense
        bundle.meta.resistance.fire += candidateEquip.resistance.fire
        bundle.meta.resistance.water += candidateEquip.resistance.water
        bundle.meta.resistance.thunder += candidateEquip.resistance.thunder
        bundle.meta.resistance.ice += candidateEquip.resistance.ice
        bundle.meta.resistance.dragon += candidateEquip.resistance.dragon

        // Increase Equip Count
        bundle.meta.equipCount += 1

        // Increase Expected Value & Level
        bundle.meta.totalExpectedValue += candidateEquip.totalExpectedValue
        bundle.meta.totalExpectedLevel += candidateEquip.totalExpectedLevel
        bundle.meta.skillExpectedValue += candidateEquip.skillExpectedValue
        bundle.meta.skillExpectedLevel += candidateEquip.skillExpectedLevel

        return bundle
    }

    /**
     * Create Candidate Equips
     */
    createCandidateEquips = (equipInfos, equipType) => {
        let candidateEquipPool = {}

        equipInfos.forEach((equipInfo) => {

            // Check is Using Factor
            if ('charm' === equipType) {
                if (Helper.isNotEmpty(this.algorithmParams.usingFactor.charm[equipInfo.seriesId])
                    && -1 !== this.algorithmParams.usingFactor.charm[equipInfo.seriesId]
                    && equipInfo.level !== this.algorithmParams.usingFactor.charm[equipInfo.seriesId]
                ) {
                    return
                }
            } else {
                if (false === this.algorithmParams.usingFactor.armor['rare' + equipInfo.rare]) {
                    return
                }

                if (Helper.isNotEmpty(this.algorithmParams.usingFactor.armor[equipInfo.seriesId])
                    && false === this.algorithmParams.usingFactor.armor[equipInfo.seriesId]
                ) {
                    return
                }
            }

            // Convert Equip to Candidate Equip
            let candidateEquip = this.convertEquipInfoToCandidateEquip(equipInfo, equipType)

            if (false === candidateEquip) {
                return
            }

            // Check is Skip Equips
            if (true === this.isCandidateEquipSkip(candidateEquip)) {
                return
            }

            // Set Used Candidate Equip Id
            this.usedEquipIds[candidateEquip.id] = true

            // Set Candidate Equip
            candidateEquipPool[candidateEquip.id] = candidateEquip
        })

        return candidateEquipPool
    }

    /**
     * Convert Equip Info To Candidate Equip
     */
    convertEquipInfoToCandidateEquip = (equipInfo, equipType) => {
        let candidateEquip = Helper.deepCopy(defaultCandidateEquipItem)

        // Set Id, Type & Defense
        candidateEquip.id = equipInfo.id
        candidateEquip.type = ('charm' !== equipType && 'weapon' !== equipType) ? equipInfo.type : equipType
        candidateEquip.defense = Helper.isNotEmpty(equipInfo.defense) ? equipInfo.defense : 0
        candidateEquip.resistance = Helper.isNotEmpty(equipInfo.resistance) ? equipInfo.resistance : candidateEquip.resistance
        candidateEquip.setId = Helper.isNotEmpty(equipInfo.set) ? equipInfo.set.id : null

        if (Helper.isEmpty(equipInfo.skills)) {
            equipInfo.skills = []
        }

        if (Helper.isEmpty(equipInfo.slots)) {
            equipInfo.slots = []
        }

        equipInfo.skills.forEach((skill) => {

            // Increase Skill Level
            candidateEquip.skillLevelMapping[skill.id] = skill.level

            if (Helper.isEmpty(this.currentSkillMapping[skill.id])) {
                return
            }

            // Increase Expected Value & Level
            let expectedValue = skill.level * this.currentSkillMapping[skill.id].decorationSize
            let expectedLevel = skill.level

            candidateEquip.totalExpectedValue += expectedValue
            candidateEquip.totalExpectedLevel += expectedLevel
            candidateEquip.skillExpectedValue += expectedValue
            candidateEquip.skillExpectedLevel += expectedLevel
        })

        equipInfo.slots.forEach((slot) => {
            candidateEquip.slotCountMapping[slot.size] += 1

            // Increase Expected Value & Level
            candidateEquip.totalExpectedValue += this.currentSlotMapping[slot.size].expectedValue
            candidateEquip.totalExpectedLevel += this.currentSlotMapping[slot.size].expectedLevel
        })

        return candidateEquip
    }

    /**
     * Get Empty Candidate Equip
     */
    getEmptyCandidateEquip = (equipType) => {
        let candidateEquip = Helper.deepCopy(defaultCandidateEquipItem)

        candidateEquip.id = 'empty' + Helper.ucfirst(equipType)
        candidateEquip.type = equipType

        return candidateEquip
    }

    /**
     * Add Decoration to Bundle
     */
    addDecorationToBundle = (bundle, slotSize, decoration, hasDecorationCountLimit = false) => {

        // Check Decoration
        if (Helper.isEmpty(decoration)) {
            return false
        }

        // Check Decoration Limit
        if (Helper.isNotEmpty(bundle.decorationMapping)
            && Helper.isNotEmpty(bundle.decorationMapping[decoration.id])
            && decoration.countLimit === bundle.decorationMapping[decoration.id]
        ) {
            return false
        }

        // Check Decoration Count
        let isSkip = false
        let decorationCount = bundle.meta.remainingSlotCountMapping[slotSize]

        decoration.skills.forEach((skill) => {
            if (true === isSkip) {
                return
            }

            if (Helper.isNotEmpty(bundle.meta.completedSkills[skill.id])) {
                isSkip = true

                return
            }

            let diffSkillLevel = this.currentSkillMapping[skill.id].level - bundle.skillLevelMapping[skill.id]
            let diffDecorationCount = parseInt(diffSkillLevel / skill.level, 10)

            if (decorationCount > diffDecorationCount) {
                decorationCount = diffDecorationCount
            }
        })

        if (true === isSkip) {
            return false
        }

        if (null !== decoration.countLimit && decorationCount > decoration.countLimit) {
            decorationCount = decoration.countLimit
        }

        if (0 === decorationCount) {
            return false
        }

        // If decoration count force set 1, then will show all combination
        if (hasDecorationCountLimit) {
            decorationCount = 1
        }

        // Increase Decorations
        bundle = Helper.deepCopy(bundle)

        if (Helper.isEmpty(bundle.decorationMapping)) {
            bundle.decorationMapping = {}
        }

        if (Helper.isEmpty(bundle.decorationMapping[decoration.id])) {
            bundle.decorationMapping[decoration.id] = 0
        }

        bundle.decorationMapping[decoration.id] += decorationCount

        // Increase Skill Level
        decoration.skills.forEach((skill) => {
            bundle.skillLevelMapping[skill.id] += decorationCount * skill.level

            if (this.currentSkillMapping[skill.id].level === bundle.skillLevelMapping[skill.id]) {
                bundle.meta.completedSkills[skill.id] = true
            }
        })

        // Decrease Slot Counts
        bundle.meta.remainingSlotCountMapping[slotSize] -= decorationCount
        bundle.meta.remainingSlotCountMapping.all -= decorationCount

        // Increase Expected Value & Level
        let expectedValue = decorationCount * decoration.expectedValue
        let expectedLevel = decorationCount * decoration.expectedLevel

        bundle.meta.skillExpectedValue += expectedValue
        bundle.meta.skillExpectedLevel += expectedLevel

        return bundle
    }

    /**
     * Is Skip Candidate Equip
     */
    isCandidateEquipSkip = (candidateEquip) => {

        // Check Used Equip Ids
        if (true === this.usedEquipIds[candidateEquip.id]) {
            return
        }

        let isSkip = false

        Object.keys(candidateEquip.skillLevelMapping).forEach((skillId) => {
            if (true === isSkip) {
                return
            }

            if (Helper.isNotEmpty(this.currentSkillMapping[skillId])
                && 0 === this.currentSkillMapping[skillId].level
            ) {
                isSkip = true
            }
        })

        return isSkip
    }

    /**
     * Is Bundle Equips Full
     */
    isBundleEquipsFull = (bundle) => {
        return this.currentEquipCount === bundle.meta.equipCount
    }

    /**
     * Is Bundle Set Compeleted
     */
    isBundleSetsCompleted = (bundle) => {
        return this.currentSetCount === Object.keys(bundle.meta.completedSets).length
    }

    /**
     * Is Bundle Skill Compeleted
     */
    isBundleSkillsCompleted = (bundle) => {
        return this.currentSkillCount === Object.keys(bundle.meta.completedSkills).length
    }

    /**
     * Is Bundle Reach Expected
     */
    isBundleReachExpected = (bundle) => {
        return this.totalExpectedValue <= bundle.meta.totalExpectedValue
            && this.totalExpectedLevel <= bundle.meta.totalExpectedLevel
    }

    /**
     * Is Bundle Have Future
     *
     * This is magic function, which is see through the future,
     * maybe will lost some results.
     */
    isBundleHaveFuture = (bundle, equipType) => {
        let expectedValue = bundle.meta.totalExpectedValue + this.equipFutureExpectedValue[equipType]
        let expectedLevel = bundle.meta.totalExpectedLevel + this.equipFutureExpectedLevel[equipType]

        return this.totalExpectedValue <= expectedValue
            && this.totalExpectedLevel <= expectedLevel
    }

    /**
     * Is Bundle Decoration Have Future
     *
     * This is magic function, which is see through the future,
     * maybe will lost some results.
     */
    isBundleDecorationHaveFuture = (bundle, slotMapping) => {
        let expectedValue = bundle.meta.skillExpectedValue
        let expectedLevel = bundle.meta.skillExpectedLevel

        for (let size of [ 4, 3, 2, 1 ]) {
            let slotCount = bundle.meta.remainingSlotCountMapping[size]

            if (0 === bundle.meta.remainingSlotCountMapping[size]) {
                continue
            }

            expectedValue += slotCount * slotMapping[size].expectedValue
            expectedLevel += slotCount * slotMapping[size].expectedLevel
        }

        return this.totalExpectedValue <= expectedValue
            && this.totalExpectedLevel <= expectedLevel
    }
}

export default new FittingAlgorithm()
