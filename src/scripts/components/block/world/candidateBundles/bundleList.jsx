/**
 * Candidate Bundles: Bundle List
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
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
import JewelDataset from '@/scripts/libraries/world/dataset/jewel'
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
    let currentEquips = Helper.deepCopy(States.world.getters.currentEquips())
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

        if (Helper.isEmpty(currentEquips[equipType])) {
            currentEquips[equipType] = {}
        }

        currentEquips[equipType].id = bundle.equipIdMapping[equipType]
        currentEquips[equipType].slotIds = []

        let equipInfo = null

        if ('weapon' === equipType) {
            if (Helper.isNotEmpty(required.equips.weapon.customWeapon)) {
                States.world.actions.replaceCustomWeapon(required.equips.weapon.customWeapon)
            }

            if (Helper.isNotEmpty(required.equips.weapon.enhances)) {
                currentEquips.weapon.enhances = required.equips.weapon.enhances // Restore Enhance
            }

            equipInfo = Misc.getAppliedWeaponInfo(currentEquips.weapon)
        } else if ('helm' === equipType
            || 'chest' === equipType
            || 'arm' === equipType
            || 'waist' === equipType
            || 'leg' === equipType
        ) {
            equipInfo = Misc.getAppliedArmorInfo(currentEquips[equipType])
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

    let jewelPackageIndex = Helper.isNotEmpty(bundle.jewelPackageIndex)
        ? bundle.jewelPackageIndex : 0

    if (Helper.isNotEmpty(bundle.jewelPackages[jewelPackageIndex])) {
        Object.keys(bundle.jewelPackages[jewelPackageIndex]).sort((jewelIdA, jewelIdB) => {
            let jewelInfoA = JewelDataset.getInfo(jewelIdA)
            let jewelInfoB = JewelDataset.getInfo(jewelIdB)

            if (Helper.isEmpty(jewelInfoA) || Helper.isEmpty(jewelInfoB)) {
                return 0
            }

            return jewelInfoA.size - jewelInfoB.size
        }).forEach((jewelId) => {
            let jewelInfo = JewelDataset.getInfo(jewelId)

            if (Helper.isEmpty(jewelInfo)) {
                return
            }

            let currentSize = jewelInfo.size

            let jewelCount = bundle.jewelPackages[jewelPackageIndex][jewelId]
            let data = null

            let jewelIndex = 0

            while (jewelIndex < jewelCount) {
                if (0 === slotMap[currentSize].length) {
                    currentSize++

                    continue
                }

                data = slotMap[currentSize].shift()

                currentEquips[data.type].slotIds[data.index] = jewelId

                jewelIndex++
            }
        })
    }

    States.world.actions.replaceCurrentEquips(currentEquips)
}

export default function BundleList(props) {

    /**
     * Hooks
     */
    const _computedResult = States.world.hooks.useComputedResult()
    const _requiredEquips = States.world.hooks.useRequiredEquips()
    const _requiredSets = States.world.hooks.useRequiredSets()
    const _requiredSkills = States.world.hooks.useRequiredSkills()

    /**
     * Handle Functions
     */
    const handleJewelPackageChange = useCallback((bundleIndex, packageIndex) => {
        let computedResult = Helper.deepCopy(_computedResult)

        computedResult.list[bundleIndex].jewelPackageIndex = packageIndex

        States.world.actions.saveComputedResult(computedResult)
    }, [_computedResult])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> BundleList')

        if (Helper.isEmpty(_computedResult)
            || Helper.isEmpty(_computedResult.required)
            || Helper.isEmpty(_computedResult.list)
        ) {
            return false
        }

        if (0 === _computedResult.list.length) {
            return (
                <div className="mhc-item mhc-item-3-step">
                    <div className="col-12 mhc-name">
                        <span>{_('noResult')}</span>
                    </div>
                </div>
            )
        }

        let bundleList = _computedResult.list
        let bundleRequired = _computedResult.required

        // Required Ids
        const requiredEquipIds = Object.keys(_requiredEquips).map((equipType) => {
            if (Helper.isEmpty(_requiredEquips[equipType])) {
                return false
            }

            return _requiredEquips[equipType].id
        })
        const requiredSetIds = _requiredSets.map((set) => {
            return set.id
        })
        const requiredSkillIds = _requiredSkills.map((skill) => {
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
            const jewelPackageCount = bundle.jewelPackages.length
            const jewelPackageIndex = Helper.isNotEmpty(bundle.jewelPackageIndex)
                ? bundle.jewelPackageIndex : 0

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

            // Bundle Equips & Jewels
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

            let bundleJewels = []

            if (Helper.isNotEmpty(bundle.jewelPackages[jewelPackageIndex])) {
                bundleJewels = Object.keys(bundle.jewelPackages[jewelPackageIndex]).map((jewelId) => {
                    let jewelInfo = JewelDataset.getInfo(jewelId)
                    let jewelCount = bundle.jewelPackages[jewelPackageIndex][jewelId]

                    for (let slotSize = jewelInfo.size; slotSize <= 4; slotSize++) {
                        if (0 === remainingSlotCountMapping[slotSize]) {
                            continue
                        }

                        if (remainingSlotCountMapping[slotSize] < jewelCount) {
                            jewelCount -= remainingSlotCountMapping[slotSize]
                            remainingSlotCountMapping.all -= remainingSlotCountMapping[slotSize]
                            remainingSlotCountMapping[slotSize] = 0

                            continue
                        }

                        remainingSlotCountMapping.all -= jewelCount
                        remainingSlotCountMapping[slotSize] -= jewelCount

                        break
                    }

                    return {
                        id: jewelId,
                        count: bundle.jewelPackages[jewelPackageIndex][jewelId]
                    }
                }).sort((jewelA, jewelB) => {
                    let jewelInfoA = JewelDataset.getInfo(jewelA.id)
                    let jewelInfoB = JewelDataset.getInfo(jewelB.id)

                    return jewelInfoA.size < jewelInfoB.size ? 1 : -1
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

                                if (Helper.isNotEmpty(_requiredEquips[equip.type])) {
                                    if ('weapon' === equip.type) {
                                        if ('customWeapon' === equip.id) {
                                            isNotRequire = Helper.jsonHash({
                                                customWeapon: equip.customWeapon,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                customWeapon: _requiredEquips[equip.type].customWeapon,
                                                enhances: _requiredEquips[equip.type].enhances
                                            })
                                        } else {
                                            isNotRequire = Helper.jsonHash({
                                                id: equip.id,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                id: _requiredEquips[equip.type].id,
                                                enhances: _requiredEquips[equip.type].enhances
                                            })
                                        }
                                    } else {
                                        isNotRequire = equip.id !== _requiredEquips[equip.type].id
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

                    {(0 !== bundleJewels.length) ? (
                        <div key={bundleIndex + '_' + jewelPackageIndex} className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('requiredJewels')}</span>
                                {1 < jewelPackageCount ? (
                                    <div className="mhc-icons_bundle">
                                        <IconSwitch
                                            defaultValue={jewelPackageIndex}
                                            options={bundle.jewelPackages.map((jewelMapping, packageIndex) => {
                                                return {
                                                    key: packageIndex,
                                                    value: `${packageIndex + 1} / ${jewelPackageCount}`
                                                }
                                            })}
                                            onChange={(packageIndex) => {
                                                handleJewelPackageChange(bundleIndex, parseInt(packageIndex), 10)
                                            }} />
                                    </div>
                                ) : false}
                            </div>
                            <div className="col-12 mhc-content">
                                {bundleJewels.map((jewel) => {
                                    let jewelInfo = JewelDataset.getInfo(jewel.id)

                                    return (Helper.isNotEmpty(jewelInfo)) ? (
                                        <div key={jewel.id} className="col-6 mhc-value">
                                            <span>{`[${jewelInfo.size}] ${_(jewelInfo.name)} x ${jewel.count}`}</span>
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
    }, [_computedResult, _requiredEquips, _requiredSets, _requiredSkills])
}
