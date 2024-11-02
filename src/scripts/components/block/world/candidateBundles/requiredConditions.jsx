/**
 * Candidate Bundles: Required Conditions
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { useState, useEffect, useMemo } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'
import SetDataset from '@/scripts/libraries/world/dataset/set'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load State Control
import States from '@/scripts/states'

export default function RequiredConditions(props) {
    const {data} = props

    /**
     * Hooks
     */
    const [stateRequiredEquips, updateRequiredEquips] = useState(States.world.getters.getRequiredEquips())
    const [stateRequiredSets, updateRequiredSets] = useState(States.world.getters.getRequiredSets())
    const [stateRequiredSkills, updateRequiredSkills] = useState(States.world.getters.getRequiredSkills())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateRequiredEquips(States.world.getters.getRequiredEquips())
            updateRequiredSets(States.world.getters.getRequiredSets())
            updateRequiredSkills(States.world.getters.getRequiredSkills())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> RequiredConditions')

        if (Helper.isEmpty(data)) {
            return false
        }

        // Required Ids
        const requiredEquipIds = Object.keys(stateRequiredEquips).map((equipType) => {
            if (Helper.isEmpty(stateRequiredEquips[equipType])) {
                return false
            }

            return stateRequiredEquips[equipType].id
        })
        const requiredSetIds = stateRequiredSets.map((set) => {
            return set.id
        })
        const requiredSkillIds = stateRequiredSkills.map((skill) => {
            return skill.id
        })

        // Current Required
        const currentRequiredEquips = Object.keys(data.equips).filter((equipType) => {
            return Helper.isNotEmpty(data.equips[equipType])
        }).map((equipType) => {
            return Object.assign({}, data.equips[equipType], {
                type: equipType
            })
        })
        const currentRequiredSets = data.sets.sort((setA, setB) => {
            return setB.step - setA.step
        })
        const currentRequiredSkills = data.skills.sort((skillA, skillB) => {
            return skillB.level - skillA.level
        })

        return (
            <div className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('conditions')}</span>
                </div>

                {0 !== currentRequiredEquips.length ? (
                    <div className="col-12 mhc-content">
                        <div className="col-12 mhc-name">
                            <span>{_('equip')}</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {currentRequiredEquips.map((equip) => {
                                let isNotRequire = true

                                if (Helper.isNotEmpty(stateRequiredEquips[equip.type])) {
                                    if ('weapon' === equip.type) {
                                        if ('customWeapon' === equip.id) {
                                            isNotRequire = Helper.jsonHash({
                                                customWeapon: equip.customWeapon,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                customWeapon: stateRequiredEquips[equip.type].customWeapon,
                                                enhances: stateRequiredEquips[equip.type].enhances
                                            })
                                        } else {
                                            isNotRequire = Helper.jsonHash({
                                                id: equip.id,
                                                enhances: equip.enhances
                                            }) !== Helper.jsonHash({
                                                id: stateRequiredEquips[equip.type].id,
                                                enhances: stateRequiredEquips[equip.type].enhances
                                            })
                                        }
                                    } else {
                                        isNotRequire = equip.id !== stateRequiredEquips[equip.type].id
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
                ) : false}

                {0 !== currentRequiredSets.length ? (
                    <div className="col-12 mhc-content">
                        <div className="col-12 mhc-name">
                            <span>{_('set')}</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {currentRequiredSets.map((set) => {
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

                {0 !== currentRequiredSkills.length ? (
                    <div className="col-12 mhc-content">
                        <div className="col-12 mhc-name">
                            <span>{_('skill')}</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {currentRequiredSkills.map((skill) => {
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
    }, [data, stateRequiredEquips, stateRequiredSets, stateRequiredSkills])
}
