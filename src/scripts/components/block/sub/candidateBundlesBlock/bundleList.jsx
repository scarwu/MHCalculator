/**
 * Candidate Bundles: Bundle List
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/misc'
import WeaponDataset from '@/scripts/libraries/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/dataset/armor'
import DecorationDataset from '@/scripts/libraries/dataset/decoration'
import SkillDataset from '@/scripts/libraries/dataset/skill'
import SetDataset from '@/scripts/libraries/dataset/set'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconSwitch from '@/scripts/components/common/iconSwitch'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleBundlePickUp = (bundle, requiredConditions) => {
    let playerEquips = Helper.deepCopy(States.getter.getPlayerEquips())
    let slotMetaMap = {
        1: [],
        2: [],
        3: []
    }

    Object.keys(bundle.equipIdMapping).forEach((equipType) => {
        if (Helper.isEmpty(bundle.equipIdMapping[equipType])) {
            return
        }

        // Create Temp Equip Data
        let tempEquipData = Object.assign({}, Helper.deepCopy(Constant.defaultPlayerEquips[equipType]), {
            id: bundle.equipIdMapping[equipType]
        })

        if (('weapon' === equipType && 'customWeapon' === bundle.equipIdMapping[equipType])
            || ('charm' === equipType && 'customCharm' === bundle.equipIdMapping[equipType])
        ) {
            tempEquipData.custom = Helper.deepCopy(requiredConditions.equips[equipType].custom)
        }

        // Get Equip Item
        let equipItem = Misc.getEquipItem(equipType, tempEquipData)

        if (Helper.isEmpty(equipItem)) {
            return
        }

        playerEquips[equipType] = tempEquipData

        // Create Slot Meta Map
        if (Helper.isNotEmpty(equipItem.slots) && 0 !== equipItem.slots.length) {
            equipItem.slots.forEach((slotData, index) => {
                slotMetaMap[slotData.size].push({
                    type: equipType,
                    index: index
                })
            })
        }
    })

    // Select Decoration Package Index
    let decorationPackageIndex = Helper.isNotEmpty(bundle.decorationPackageIndex)
        ? bundle.decorationPackageIndex : 0

    if (Helper.isNotEmpty(bundle.decorationPackages[decorationPackageIndex])) {
        Object.keys(bundle.decorationPackages[decorationPackageIndex]).sort((decorationIdA, decorationIdB) => {
            let decorationItemA = DecorationDataset.getItem(decorationIdA)
            let decorationItemB = DecorationDataset.getItem(decorationIdB)

            if (Helper.isEmpty(decorationItemA) || Helper.isEmpty(decorationItemB)) {
                return 0
            }

            return decorationItemA.size - decorationItemB.size
        }).forEach((decorationId) => {
            let decorationItem = DecorationDataset.getItem(decorationId)

            if (Helper.isEmpty(decorationItem)) {
                return
            }

            let currentSize = decorationItem.size

            let decorationCount = bundle.decorationPackages[decorationPackageIndex][decorationId]
            let slotMeta = null

            let decorationIndex = 0

            while (decorationIndex < decorationCount) {
                if (0 === slotMetaMap[currentSize].length) {
                    currentSize++

                    continue
                }

                slotMeta = slotMetaMap[currentSize].shift()

                playerEquips[slotMeta.type].decorationIds[slotMeta.index] = decorationId

                decorationIndex++
            }
        })
    }

    States.setter.replacePlayerEquips(playerEquips)
}

export default function BundleList (props) {

    /**
     * Hooks
     */
    const [stateCandidateBundles, updateCandidateBundles] = useState(States.getter.getCandidateBundles())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateCandidateBundles(States.getter.getCandidateBundles())
            updateRequiredConditions(States.getter.getRequiredConditions())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleDecorationPackageChange = useCallback((bundleIndex, packageIndex) => {
        let computedResult = Helper.deepCopy(stateCandidateBundles)

        computedResult.list[bundleIndex].decorationPackageIndex = packageIndex

        States.setter.saveCandidateBundles(computedResult)
    }, [stateCandidateBundles])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> BundleList')

        if (Helper.isEmpty(stateCandidateBundles)
            || Helper.isEmpty(stateCandidateBundles.requiredConditions)
            || Helper.isEmpty(stateCandidateBundles.list)
        ) {
            return false
        }

        if (0 === stateCandidateBundles.list.length) {
            return (
                <div className="mhrc-item mhrc-item-3-step">
                    <div className="col-12 mhrc-name">
                        <span>{_('noResult')}</span>
                    </div>
                </div>
            )
        }

        let bundleList = stateCandidateBundles.list
        let bundleRequiredConditions = stateCandidateBundles.requiredConditions

        // Required Ids
        const requiredEquipIds = Object.keys(stateRequiredConditions.equips).map((equipType) => {
            if (Helper.isEmpty(stateRequiredConditions.equips[equipType])) {
                return false
            }

            return stateRequiredConditions.equips[equipType].id
        })
        const requiredSetIds = stateRequiredConditions.sets.map((set) => {
            return set.id
        })
        const requiredSkillIds = stateRequiredConditions.skills.map((skill) => {
            return skill.id
        })

        // Current Required Ids
        const currentRequiredSetIds = bundleRequiredConditions.sets.map((set) => {
            return set.id
        })
        const currentRequiredSkillIds = bundleRequiredConditions.skills.map((skill) => {
            return skill.id
        })

        return bundleList.map((bundle, bundleIndex) => {
            const decorationPackageCount = bundle.decorationPackages.length
            const decorationPackageIndex = Helper.isNotEmpty(bundle.decorationPackageIndex)
                ? bundle.decorationPackageIndex : 0

            // Remaining Slot Count Mapping
            let remainingSlotCountMapping = {
                1: 0,
                2: 0,
                3: 0,
                all: 0
            }

            Object.keys(bundle.slotCountMapping).forEach((slotSize) => {
                remainingSlotCountMapping.all += bundle.slotCountMapping[slotSize]
                remainingSlotCountMapping[slotSize] += bundle.slotCountMapping[slotSize]
            })

            // Bundle Equips & Decorations
            const bundleEquipList = Object.keys(bundle.equipIdMapping).filter((equipType) => {
                return Helper.isNotEmpty(bundle.equipIdMapping[equipType])
            }).map((equipType) => {
                if (Helper.isNotEmpty(bundleRequiredConditions.equips[equipType])
                    && Helper.isNotEmpty(bundleRequiredConditions.equips[equipType].id)
                ) {
                    return Object.assign({}, bundleRequiredConditions.equips[equipType], {
                        type: equipType
                    })
                }

                return Object.assign({}, Constant.defaultPlayerEquips[equipType], {
                    id: bundle.equipIdMapping[equipType],
                    type: equipType
                })
            })

            let bundleDecorations = []

            if (Helper.isNotEmpty(bundle.decorationPackages[decorationPackageIndex])) {
                bundleDecorations = Object.keys(bundle.decorationPackages[decorationPackageIndex]).map((decorationId) => {
                    let decorationItem = DecorationDataset.getItem(decorationId)
                    let decorationCount = bundle.decorationPackages[decorationPackageIndex][decorationId]

                    for (let slotSize = decorationItem.size; slotSize <= 4; slotSize++) {
                        if (0 === remainingSlotCountMapping[slotSize]) {
                            continue
                        }

                        if (remainingSlotCountMapping[slotSize] < decorationCount) {
                            decorationCount -= remainingSlotCountMapping[slotSize]
                            remainingSlotCountMapping.all -= remainingSlotCountMapping[slotSize]
                            remainingSlotCountMapping[slotSize] = 0

                            continue
                        }

                        remainingSlotCountMapping.all -= decorationCount
                        remainingSlotCountMapping[slotSize] -= decorationCount

                        break
                    }

                    return {
                        id: decorationId,
                        count: bundle.decorationPackages[decorationPackageIndex][decorationId]
                    }
                }).sort((decorationA, decorationB) => {
                    let decorationItemA = DecorationDataset.getItem(decorationA.id)
                    let decorationItemB = DecorationDataset.getItem(decorationB.id)

                    return decorationItemA.size < decorationItemB.size ? 1 : -1
                })
            }

            // Additional Sets & Skills
            const additionalSets = Object.keys(bundle.setCountMapping).map((setId) => {
                let setItem = SetDataset.getItem(setId)

                if (Helper.isEmpty(setItem)) {
                    return false
                }

                return {
                    id: setId,
                    count: bundle.setCountMapping[setId]
                }
            }).filter((setData) => {
                if (false === setData) {
                    return false
                }

                if (-1 !== currentRequiredSetIds.indexOf(setData.id)) {
                    return false
                }

                if (3 > setData.count) {
                    return false
                }

                return true
            }).sort((setA, setB) => {
                return setB.count - setA.count
            })

            const additionalSkills = Object.keys(bundle.skillLevelMapping).map((skillId) => {
                return {
                    id: skillId,
                    level: bundle.skillLevelMapping[skillId]
                }
            }).filter((skill) => {
                return -1 === currentRequiredSkillIds.indexOf(skill.id)
            }).sort((skillA, skillB) => {
                return skillB.level - skillA.level
            })

            return (
                <div key={bundle.hash} className="mhrc-item mhrc-item-3-step">
                    <div className="col-12 mhrc-name">
                        <span>{_('bundle')}: {bundleIndex + 1} / {bundleList.length}</span>
                        <div className="mhrc-icons_bundle">
                            <IconButton
                                iconName="check" altName={_('equip')}
                                onClick={() => {
                                    handleBundlePickUp(bundle, bundleRequiredConditions)
                                }} />
                        </div>
                    </div>

                    {Helper.isNotEmpty(bundle.meta.sortBy) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-4 mhrc-name">
                                <span>{_(bundle.meta.sortBy.key + 'Sort')}</span>
                            </div>
                            <div className="col-8 mhrc-value">
                                <span>{bundle.meta.sortBy.value}</span>
                            </div>
                        </div>
                    ) : false}

                    <div className="col-12 mhrc-content">
                        <div className="col-12 mhrc-name">
                            <span>{_('requiredEquips')}</span>
                        </div>
                        <div className="col-12 mhrc-content">
                            {bundleEquipList.map((bundleEquipData) => {
                                let requiredEquipData = stateRequiredConditions.equips[bundleEquipData.type]

                                // Can Add to Required Contditions
                                let isNotRequire = false

                                if (Helper.isNotEmpty(bundleEquipData.id)) {
                                    isNotRequire = Helper.jsonHash({
                                        id: bundleEquipData.id,
                                        custom: bundleEquipData.custom
                                    }) !== Helper.jsonHash({
                                        id: requiredEquipData.id,
                                        custom: requiredEquipData.custom
                                    })
                                }

                                let equipItem = Misc.getEquipItem(bundleEquipData.type, bundleEquipData)

                                return Helper.isNotEmpty(equipItem) ? (
                                    <div key={bundleEquipData.type} className="col-6 mhrc-value">
                                        <span>{_(equipItem.name)}</span>

                                        <div className="mhrc-icons_bundle">
                                            {isNotRequire ? (
                                                <IconButton
                                                    iconName="arrow-left" altName={_('include')}
                                                    onClick={() => {
                                                        States.setter.replaceRequiredConditionsEquipData(bundleEquipData.type, bundleEquipData)
                                                    }} />
                                            ) : false}
                                        </div>
                                    </div>
                                ) : false
                            })}
                        </div>
                    </div>

                    {(0 !== bundleDecorations.length) ? (
                        <div key={bundleIndex + '_' + decorationPackageIndex} className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('requiredDecorations')}</span>
                                {1 < decorationPackageCount ? (
                                    <div className="mhrc-icons_bundle">
                                        <IconSwitch
                                            defaultValue={decorationPackageIndex}
                                            options={bundle.decorationPackages.map((decorationMapping, packageIndex) => {
                                                return {
                                                    key: packageIndex,
                                                    value: `${packageIndex + 1} / ${decorationPackageCount}`
                                                }
                                            })}
                                            onChange={(packageIndex) => {
                                                handleDecorationPackageChange(bundleIndex, parseInt(packageIndex), 10)
                                            }} />
                                    </div>
                                ) : false}
                            </div>
                            <div className="col-12 mhrc-content">
                                {bundleDecorations.map((decoration) => {
                                    let decorationItem = DecorationDataset.getItem(decoration.id)

                                    return (Helper.isNotEmpty(decorationItem)) ? (
                                        <div key={decoration.id} className="col-6 mhrc-value">
                                            <span>{`[${decorationItem.size}] ${_(decorationItem.name)} x ${decoration.count}`}</span>
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== remainingSlotCountMapping.all) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('remainingSlot')}</span>
                            </div>
                            <div className="col-12 mhrc-content">
                                {Object.keys(remainingSlotCountMapping).map((slotSize) => {
                                    if ('all' === slotSize) {
                                        return
                                    }

                                    let slotCount = remainingSlotCountMapping[slotSize]

                                    return (slotCount > 0) ? (
                                        <div key={slotSize} className="col-4 mhrc-value">
                                            <span>{`[${slotSize}] x ${slotCount}`}</span>
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== additionalSets.filter((setData) => {
                        return 3 <= setData.count
                    }).length) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('additionalSets')}</span>
                            </div>
                            <div className="col-12 mhrc-content">
                                {additionalSets.map((setData) => {
                                    let setItem = SetDataset.getItem(setData.id)

                                    return (
                                        <div key={setData.id} className="col-6 mhrc-value">
                                            <span>{_(setItem.name)} x {setData.count}</span>

                                            {(-1 === requiredSetIds.indexOf(setItem.id)) ? (
                                                <div className="mhrc-icons_bundle">
                                                    <IconButton
                                                        iconName="arrow-left" altName={_('include')}
                                                        onClick={() => {
                                                            States.setter.addRequiredConditionsSet(setItem.id)
                                                        }} />
                                                </div>
                                            ) : false}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== additionalSkills.length) ? (
                        <div className="col-12 mhrc-content">
                            <div className="col-12 mhrc-name">
                                <span>{_('additionalSkills')}</span>
                            </div>
                            <div className="col-12 mhrc-content">
                                {additionalSkills.map((skillData) => {
                                    let skillItem = SkillDataset.getItem(skillData.id)

                                    return (Helper.isNotEmpty(skillItem)) ? (
                                        <div key={skillData.id} className="col-6 mhrc-value">
                                            <span>{`${_(skillItem.name)} Lv.${skillData.level}`}</span>

                                            {(-1 === requiredSkillIds.indexOf(skillItem.id)) ? (
                                                <div className="mhrc-icons_bundle">
                                                    <IconButton
                                                        iconName="arrow-left" altName={_('include')}
                                                        onClick={() => {
                                                            States.setter.addRequiredConditionsSkill(skillItem.id)
                                                        }} />
                                                </div>
                                            ) : false}
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}
                </div>
            )
        })
    }, [
        stateCandidateBundles,
        stateRequiredConditions
    ])
}
