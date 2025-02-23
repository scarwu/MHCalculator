/**
 * Candidate Bundles: Bundle List
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/world/misc'
import WeaponDataset from '@/scripts/libraries/world/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'
import DecorationDataset from '@/scripts/libraries/world/dataset/decoration'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'
import SetDataset from '@/scripts/libraries/world/dataset/set'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconSwitch from '@/scripts/components/ui/iconSwitch'

// Load State Control
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleBundlePickUp = (bundle, required) => {
    let playerEquips = Helper.deepCopy(States.world.getters.playerEquips())
    let slotMap = {
        1: [],
        2: [],
        3: [],
        4: []
    }

    Object.keys(bundle.equipIdMapping).forEach((equipType) => {
        if (Helper.isEmpty(bundle.equipIdMapping[equipType])) {
            return
        }

        if (Helper.isEmpty(playerEquips[equipType])) {
            playerEquips[equipType] = {}
        }

        playerEquips[equipType].id = bundle.equipIdMapping[equipType]
        playerEquips[equipType].slotIds = []

        let equipInfo = null

        if ('weapon' === equipType) {
            if (Helper.isNotEmpty(required.equips.weapon.customWeapon)) {
                States.world.actions.replaceCustomWeapon(required.equips.weapon.customWeapon)
            }

            if (Helper.isNotEmpty(required.equips.weapon.enhances)) {
                playerEquips.weapon.enhances = required.equips.weapon.enhances // Restore Enhance
            }

            equipInfo = Misc.getAppliedWeaponInfo(playerEquips.weapon)
        } else if ('helm' === equipType
            || 'chest' === equipType
            || 'arm' === equipType
            || 'waist' === equipType
            || 'leg' === equipType
        ) {
            equipInfo = Misc.getAppliedArmorInfo(playerEquips[equipType])
        }

        if (Helper.isEmpty(equipInfo)) {
            return
        }

        equipInfo.slots.forEach((data, index) => {
            slotMap[data.size].push({
                type: equipType,
                index: index
            })
        })
    })

    let decorationPackageIndex = Helper.isNotEmpty(bundle.decorationPackageIndex)
        ? bundle.decorationPackageIndex : 0

    if (Helper.isNotEmpty(bundle.decorationPackages[decorationPackageIndex])) {
        Object.keys(bundle.decorationPackages[decorationPackageIndex]).sort((decorationIdA, decorationIdB) => {
            let decorationInfoA = DecorationDataset.getInfo(decorationIdA)
            let decorationInfoB = DecorationDataset.getInfo(decorationIdB)

            if (Helper.isEmpty(decorationInfoA) || Helper.isEmpty(decorationInfoB)) {
                return 0
            }

            return decorationInfoA.size - decorationInfoB.size
        }).forEach((decorationId) => {
            let decorationInfo = DecorationDataset.getInfo(decorationId)

            if (Helper.isEmpty(decorationInfo)) {
                return
            }

            let currentSize = decorationInfo.size

            let decorationCount = bundle.decorationPackages[decorationPackageIndex][decorationId]
            let data = null

            let decorationIndex = 0

            while (decorationIndex < decorationCount) {
                if (0 === slotMap[currentSize].length) {
                    currentSize++

                    continue
                }

                data = slotMap[currentSize].shift()

                playerEquips[data.type].slotIds[data.index] = decorationId

                decorationIndex++
            }
        })
    }

    States.world.actions.replacePlayerEquips(playerEquips)
}

export default function BundleList (props) {

    /**
     * Hooks
     */
    const _candidateBundles = States.world.hooks.useCandidateBundles()
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    /**
     * Handle Functions
     */
    const handleDecorationPackageChange = useCallback((bundleIndex, packageIndex) => {
        let candidateBundles = Helper.deepCopy(_candidateBundles)

        candidateBundles.list[bundleIndex].decorationPackageIndex = packageIndex

        States.world.actions.replaceCandidateBundles(candidateBundles)
    }, [_candidateBundles])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> BundleList')

        if (Helper.isEmpty(_candidateBundles)
            || Helper.isEmpty(_candidateBundles.required)
            || Helper.isEmpty(_candidateBundles.list)
        ) {
            return false
        }

        if (0 === _candidateBundles.list.length) {
            return (
                <div className="mhc-item mhc-item-3-step">
                    <div className="col-12 mhc-name">
                        <span>{_('noResult')}</span>
                    </div>
                </div>
            )
        }

        let bundleList = _candidateBundles.list
        let bundleRequired = _candidateBundles.required

        // Required Ids
        const requiredEquipIds = Object.keys(_requiredConditions.equips).map((equipType) => {
            if (Helper.isEmpty(_requiredConditions.equips[equipType])) {
                return false
            }

            return _requiredConditions.equips[equipType].id
        })
        const requiredSetIds = _requiredConditions.sets.map((set) => {
            return set.id
        })
        const requiredSkillIds = _requiredConditions.skills.map((skill) => {
            return skill.id
        })

        // Current Required Ids
        const currentRequiredSetIds = bundleRequired.sets.map((set) => {
            return set.id
        })
        const currentRequiredSkillIds = bundleRequired.skills.map((skill) => {
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
                4: 0,
                all: 0
            }

            Object.keys(bundle.slotCountMapping).forEach((slotSize) => {
                remainingSlotCountMapping.all += bundle.slotCountMapping[slotSize]
                remainingSlotCountMapping[slotSize] += bundle.slotCountMapping[slotSize]
            })

            // Bundle Equips & Decorations
            const bundleEquips = Object.keys(bundle.equipIdMapping).filter((equipType) => {
                return Helper.isNotEmpty(bundle.equipIdMapping[equipType])
            }).map((equipType) => {
                if ('weapon' === equipType) {
                    return Object.assign({}, bundleRequired.equips[equipType], {
                        type: equipType
                    })
                }

                return {
                    id: bundle.equipIdMapping[equipType],
                    type: equipType
                }
            })

            let bundleDecorations = []

            if (Helper.isNotEmpty(bundle.decorationPackages[decorationPackageIndex])) {
                bundleDecorations = Object.keys(bundle.decorationPackages[decorationPackageIndex]).map((decorationId) => {
                    let decorationInfo = DecorationDataset.getInfo(decorationId)
                    let decorationCount = bundle.decorationPackages[decorationPackageIndex][decorationId]

                    for (let slotSize = decorationInfo.size; slotSize <= 4; slotSize++) {
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
                    let decorationInfoA = DecorationDataset.getInfo(decorationA.id)
                    let decorationInfoB = DecorationDataset.getInfo(decorationB.id)

                    return decorationInfoA.size < decorationInfoB.size ? 1 : -1
                })
            }

            // Additional Sets & Skills
            const additionalSets = Object.keys(bundle.setCountMapping).map((setId) => {
                let setInfo = SetDataset.getInfo(setId)

                if (Helper.isEmpty(setInfo)) {
                    return false
                }

                let setStep = setInfo.skills.filter((skill) => {
                    return skill.require <= bundle.setCountMapping[setId]
                }).length

                return {
                    id: setId,
                    step: setStep
                }
            }).filter((set) => {
                if (false === set) {
                    return false
                }

                if (-1 !== currentRequiredSetIds.indexOf(set.id)) {
                    return false
                }

                if (0 === set.step) {
                    return false
                }

                return true
            }).sort((setA, setB) => {
                return setB.step - setA.step
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
                <div key={bundle.hash} className="mhc-item mhc-item-3-step">
                    <div className="col-12 mhc-name">
                        <span>{_('bundle')}: {bundleIndex + 1} / {bundleList.length}</span>
                        <div className="mhc-icons_bundle">
                            <IconButton
                                iconName="check" altName={_('equip')}
                                onClick={() => {handleBundlePickUp(bundle, bundleRequired)}} />
                        </div>
                    </div>

                    {Helper.isNotEmpty(bundle.meta.sortBy) ? (
                        <div className="col-12 mhc-content">
                            <div className="col-4 mhc-name">
                                <span>{_(bundle.meta.sortBy.key + 'Sort')}</span>
                            </div>
                            <div className="col-8 mhc-value">
                                <span>{bundle.meta.sortBy.value}</span>
                            </div>
                        </div>
                    ) : false}

                    <div className="col-12 mhc-content">
                        <div className="col-12 mhc-name">
                            <span>{_('requiredEquips')}</span>
                        </div>
                        <div className="col-12 mhc-content">
                            {bundleEquips.map((equip) => {
                                let isNotRequire = true

                                if (Helper.isNotEmpty(_requiredConditions.equips[equip.type])) {
                                    if ('weapon' === equip.type) {
                                        if ('customWeapon' === equip.id) {
                                            isNotRequire = Helper.jsonHash({
                                                customWeapon: equip.customWeapon,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                customWeapon: _requiredConditions.equips[equip.type].customWeapon,
                                                enhances: _requiredConditions.equips[equip.type].enhances
                                            })
                                        } else {
                                            isNotRequire = Helper.jsonHash({
                                                id: equip.id,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                id: _requiredConditions.equips[equip.type].id,
                                                enhances: _requiredConditions.equips[equip.type].enhances
                                            })
                                        }
                                    } else {
                                        isNotRequire = equip.id !== _requiredConditions.equips[equip.type].id
                                    }
                                }

                                let equipInfo = null

                                if ('weapon' === equip.type) {
                                    if ('customWeapon' === equip.id) {
                                        equipInfo = equip.customWeapon

                                        return Helper.isNotEmpty(equipInfo) ? (
                                            <div key={equip.type} className="col-6 mhc-value">
                                                <span>{_(equipInfo.name)}: {_(equipInfo.type)}</span>

                                                <div className="mhc-icons_bundle">
                                                    {isNotRequire ? (
                                                        <IconButton
                                                            iconName="arrow-left" altName={_('include')}
                                                            onClick={() => {States.world.actions.setRequiredEquips(equip.type, equipInfo)}} />
                                                    ) : false}
                                                </div>
                                            </div>
                                        ) : false
                                    }

                                    equipInfo = WeaponDataset.getInfo(equip.id)
                                } else if ('helm' === equip.type
                                    || 'chest' === equip.type
                                    || 'arm' === equip.type
                                    || 'waist' === equip.type
                                    || 'leg' === equip.type
                                ) {
                                    equipInfo = ArmorDataset.getInfo(equip.id)
                                } else if ('charm' === equip.type) {
                                    equipInfo = CharmDataset.getInfo(equip.id)
                                }

                                return Helper.isNotEmpty(equipInfo) ? (
                                    <div key={equip.type} className="col-6 mhc-value">
                                        <span>{_(equipInfo.name)}</span>

                                        <div className="mhc-icons_bundle">
                                            {isNotRequire ? (
                                                <IconButton
                                                    iconName="arrow-left" altName={_('include')}
                                                    onClick={() => {States.world.actions.setRequiredEquips(equip.type, equipInfo)}} />
                                            ) : false}
                                        </div>
                                    </div>
                                ) : false
                            })}
                        </div>
                    </div>

                    {(0 !== bundleDecorations.length) ? (
                        <div key={bundleIndex + '_' + decorationPackageIndex} className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('requiredDecorations')}</span>
                                {1 < decorationPackageCount ? (
                                    <div className="mhc-icons_bundle">
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
                            <div className="col-12 mhc-content">
                                {bundleDecorations.map((decoration) => {
                                    let decorationInfo = DecorationDataset.getInfo(decoration.id)

                                    return (Helper.isNotEmpty(decorationInfo)) ? (
                                        <div key={decoration.id} className="col-6 mhc-value">
                                            <span>{`[${decorationInfo.size}] ${_(decorationInfo.name)} x ${decoration.count}`}</span>
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== remainingSlotCountMapping.all) ? (
                        <div className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('remainingSlot')}</span>
                            </div>
                            <div className="col-12 mhc-content">
                                {Object.keys(remainingSlotCountMapping).map((slotSize) => {
                                    if ('all' === slotSize) {
                                        return
                                    }

                                    let slotCount = remainingSlotCountMapping[slotSize]

                                    return (slotCount > 0) ? (
                                        <div key={slotSize} className="col-4 mhc-value">
                                            <span>{`[${slotSize}] x ${slotCount}`}</span>
                                        </div>
                                    ) : false
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== additionalSets.length) ? (
                        <div className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('additionalSets')}</span>
                            </div>
                            <div className="col-12 mhc-content">
                                {additionalSets.map((set) => {
                                    let setInfo = SetDataset.getInfo(set.id)

                                    return (
                                        <div key={set.id} className="col-6 mhc-value">
                                            <span>
                                                {`${_(setInfo.name)}`}{setInfo.skills.slice(0, set.step).map((skill) => {
                                                    return ` (${skill.require})`
                                                })}
                                            </span>
                                            {(-1 === requiredSetIds.indexOf(setInfo.id)) ? (
                                                <div className="mhc-icons_bundle">
                                                    <IconButton
                                                        iconName="arrow-left" altName={_('include')}
                                                        onClick={() => {States.world.actions.addRequiredSet(setInfo.id)}} />
                                                </div>
                                            ) : false}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : false}

                    {(0 !== additionalSkills.length) ? (
                        <div className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('additionalSkills')}</span>
                            </div>
                            <div className="col-12 mhc-content">
                                {additionalSkills.map((skill) => {
                                    let skillInfo = SkillDataset.getInfo(skill.id)

                                    return (Helper.isNotEmpty(skillInfo)) ? (
                                        <div key={skill.id} className="col-6 mhc-value">
                                            <span>{`${_(skillInfo.name)} Lv.${skill.level}`}</span>
                                            {(-1 === requiredSkillIds.indexOf(skillInfo.id)) ? (
                                                <div className="mhc-icons_bundle">
                                                    <IconButton
                                                        iconName="arrow-left" altName={_('include')}
                                                        onClick={() => {States.world.actions.addRequiredSkill(skillInfo.id)}} />
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
    }, [_candidateBundles, _requiredConditions])
}
