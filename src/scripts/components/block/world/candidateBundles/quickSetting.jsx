/**
 * Candidate Bundles: Quick Setting
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
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'
import DecorationDataset from '@/scripts/libraries/world/dataset/decoration'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import BasicSelector from '@/scripts/components/ui/basicSelector'

// Load State Control
import States from '@/scripts/states'

const levelMapping = [ 'I', 'II', 'III', 'IV', 'V' ]

export default function QuickSetting (props) {
    const {data} = props

    /**
     * Hooks
     */
    const _algorithmParams = States.world.hooks.useAlgorithmParams()
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> QuickFactorSetting')

        let armorSeriesMapping = {}
        let charmSeriesMapping = {}
        let decorationMapping = {}
        let skillLevelMapping = {}

        const equipTypes = Object.keys(_requiredConditions.equips).filter((equipType) => {
            if ('weapon' === equipType || 'charm' === equipType) {
                return false
            }

            return Helper.isEmpty(_requiredConditions.equips[equipType])
        })
        const setIds = _requiredConditions.sets.map((set) => {
            return set.id
        })
        const skillIds = _requiredConditions.skills.map((skill) => {
            skillLevelMapping[skill.id] = skill.level

            return skill.id
        })

        ArmorDataset.typesIs(equipTypes).setsIs(setIds).getItems().forEach((armorInfo) => {
            if (false === _algorithmParams.usingFactor.armor['rare' + armorInfo.rare]) {
                return
            }

            let isSkip = false

            armorInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skill.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorInfo.rare])) {
                armorSeriesMapping[armorInfo.rare] = {}
            }

            armorSeriesMapping[armorInfo.rare][armorInfo.seriesId] = {
                name: armorInfo.series
            }
        })

        ArmorDataset.typesIs(equipTypes).hasSkills(skillIds).getItems().forEach((armorInfo) => {
            if (false === _algorithmParams.usingFactor.armor['rare' + armorInfo.rare]) {
                return
            }

            let isSkip = false

            armorInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skill.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(armorSeriesMapping[armorInfo.rare])) {
                armorSeriesMapping[armorInfo.rare] = {}
            }

            armorSeriesMapping[armorInfo.rare][armorInfo.seriesId] = {
                name: armorInfo.series
            }
        })

        if (Helper.isEmpty(_requiredConditions.equips.charm)) {
            CharmDataset.hasSkills(skillIds).getItems().forEach((charmInfo) => {
                let isSkip = false

                charmInfo.skills.forEach((skill) => {
                    if (true === isSkip) {
                        return
                    }

                    if (0 === skillLevelMapping[skill.id]) {
                        isSkip = true

                        return
                    }
                })

                if (true === isSkip) {
                    return
                }

                if (Helper.isEmpty(charmSeriesMapping[charmInfo.seriesId])) {
                    charmSeriesMapping[charmInfo.seriesId] = {
                        series: charmInfo.series,
                        min: 1,
                        max: 1
                    }
                }

                if (charmSeriesMapping[charmInfo.seriesId].max < charmInfo.level) {
                    charmSeriesMapping[charmInfo.seriesId].max = charmInfo.level
                }
            })
        }

        DecorationDataset.hasSkills(skillIds, true).getItems().forEach((decorationInfo) => {
            let isSkip = false

            decorationInfo.skills.forEach((skill) => {
                if (true === isSkip) {
                    return
                }

                if (0 === skillLevelMapping[skill.id]) {
                    isSkip = true

                    return
                }
            })

            if (true === isSkip) {
                return
            }

            if (Helper.isEmpty(decorationMapping[decorationInfo.size])) {
                decorationMapping[decorationInfo.size] = {}
            }

            if (Helper.isEmpty(decorationMapping[decorationInfo.size][decorationInfo.id])) {
                decorationMapping[decorationInfo.size][decorationInfo.id] = {
                    name: decorationInfo.name,
                    min: 1,
                    max: 1
                }
            }

            decorationInfo.skills.forEach((skill) => {
                let skillInfo = SkillDataset.getInfo(skill.id)

                if (decorationMapping[decorationInfo.size][decorationInfo.id].max < skillInfo.list.length) {
                    decorationMapping[decorationInfo.size][decorationInfo.id].max = skillInfo.list.length
                }
            })
        })

        let armorFactor = _algorithmParams.usingFactor.armor
        let charmFactor = _algorithmParams.usingFactor.charm
        let decorationFactor = _algorithmParams.usingFactor.decoration

        return (
            <div className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('quickSetting')}</span>
                </div>

                {0 !== Object.keys(armorSeriesMapping).length ? Object.keys(armorSeriesMapping).sort((rareA, rareB) => {
                    return rareA > rareB ? 1 : -1
                }).map((rare) => {
                    return (
                        <div key={rare} className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('armorFactor')}: R{rare}</span>
                            </div>

                            <div className="col-12 mhc-content">
                                {Object.keys(armorSeriesMapping[rare]).sort((seriesIdA, seriesIdB) => {
                                    return _(seriesIdA) > _(seriesIdB) ? 1 : -1
                                }).map((seriesId) => {
                                    let isInclude = Helper.isNotEmpty(armorFactor[seriesId])
                                        ? armorFactor[seriesId] : true

                                    return (
                                        <div key={seriesId} className="col-6 mhc-value">
                                            <span>{_(armorSeriesMapping[rare][seriesId].name)}</span>
                                            <div className="mhc-icons_bundle">
                                                {isInclude ? (
                                                    <IconButton
                                                        iconName="star"
                                                        altName={_('exclude')}
                                                        onClick={() => {States.world.actions.setAlgorithmParamsUsingFactor('armor', seriesId, false)}} />
                                                ) : (
                                                    <IconButton
                                                        iconName="star-o"
                                                        altName={_('include')}
                                                        onClick={() => {States.world.actions.setAlgorithmParamsUsingFactor('armor', seriesId, true)}} />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }) : false}

                {0 !== Object.keys(charmSeriesMapping).length ? (
                    <div className="col-12 mhc-content">
                        <div className="col-12 mhc-name">
                            <span>{_('charmFactor')}</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {Object.keys(charmSeriesMapping).sort((seriesIdA, seriesIdB) => {
                                return _(seriesIdA) > _(seriesIdB) ? 1 : -1
                            }).map((seriesId) => {
                                let selectLevel = Helper.isNotEmpty(charmFactor[seriesId])
                                    ? charmFactor[seriesId] : -1
                                let levelList = [
                                    { key: -1, value: _('all') },
                                    { key: 0, value: _('exclude') }
                                ]

                                let countableEmptyArray = [...Array(charmSeriesMapping[seriesId].max - charmSeriesMapping[seriesId].min + 1).keys()]

                                countableEmptyArray.forEach((data, index) => {
                                    levelList.push({ key: index + 1, value: levelMapping[index] })
                                })

                                return (
                                    <div key={seriesId} className="col-6 mhc-value">
                                        <span>{_(charmSeriesMapping[seriesId].series)}</span>
                                        <div className="mhc-icons_bundle">
                                            <BasicSelector
                                                iconName="sort-numeric-asc"
                                                defaultValue={selectLevel}
                                                options={levelList} onChange={(event) => {
                                                    States.world.actions.setAlgorithmParamsUsingFactor('charm', seriesId, parseInt(event.target.value))
                                                }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : false}

                {0 !== Object.keys(decorationMapping).length ? Object.keys(decorationMapping).sort((sizeA, sizeB) => {
                    return sizeA > sizeB ? 1 : -1
                }).map((size) => {
                    return (
                        <div key={size} className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('decorationFactor')}: [{size}]</span>
                            </div>

                            <div className="col-12 mhc-content">
                                {Object.keys(decorationMapping[size]).sort((decorationIdA, decorationIdB) => {
                                    return _(decorationIdA) > _(decorationIdB) ? 1 : -1
                                }).map((decorationId) => {
                                    let selectLevel = Helper.isNotEmpty(decorationFactor[decorationId])
                                        ? decorationFactor[decorationId] : -1
                                    let diffLevel = decorationMapping[size][decorationId].max - decorationMapping[size][decorationId].min + 1
                                    let levelList = [
                                        { key: -1, value: _('unlimited') },
                                        { key: 0, value: _('exclude') }
                                    ]

                                    let countableEmptyArray = [...Array(diffLevel).keys()]

                                    countableEmptyArray.forEach((data, index) => {
                                        levelList.push({ key: index + 1, value: index + 1 })
                                    })

                                    return (
                                        <div key={decorationId} className="col-6 mhc-value">
                                            <span>{_(decorationMapping[size][decorationId].name)}</span>

                                            <div className="mhc-icons_bundle">
                                                <BasicSelector
                                                    iconName="sort-numeric-asc"
                                                    defaultValue={selectLevel}
                                                    options={levelList} onChange={(event) => {
                                                        States.world.actions.setAlgorithmParamsUsingFactor('decoration', decorationId, parseInt(event.target.value))
                                                    }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }) : false}
            </div>
        )
    }, [data, _algorithmParams, _requiredConditions])
}
