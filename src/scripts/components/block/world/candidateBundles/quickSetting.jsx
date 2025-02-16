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
import JewelDataset from '@/scripts/libraries/world/dataset/jewel'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import BasicSelector from '@/scripts/components/ui/basicSelector'

// Load State Control
import States from '@/scripts/states'

const levelMapping = [ 'I', 'II', 'III', 'IV', 'V' ]

export default function QuickSetting(props) {
    const {data} = props

    /**
     * Hooks
     */
    const _algorithmParams = States.world.hooks.useAlgorithmParams()
    const _requiredEquips = States.world.hooks.useRequiredEquips()
    const _requiredSets = States.world.hooks.useRequiredSets()
    const _requiredSkills = States.world.hooks.useRequiredSkills()

    return useMemo(() => {
        Helper.debug('Component: CandidateBundles -> QuickFactorSetting')

        let armorSeriesMapping = {}
        let charmSeriesMapping = {}
        let jewelMapping = {}
        let skillLevelMapping = {}

        const equipTypes = Object.keys(_requiredEquips).filter((equipType) => {
            if ('weapon' === equipType || 'charm' === equipType) {
                return false
            }

            return Helper.isEmpty(_requiredEquips[equipType])
        })
        const setIds = _requiredSets.map((set) => {
            return set.id
        })
        const skillIds = _requiredSkills.map((skill) => {
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

        if (Helper.isEmpty(_requiredEquips.charm)) {
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

        JewelDataset.hasSkills(skillIds, true).getItems().forEach((jewelInfo) => {
            let isSkip = false

            jewelInfo.skills.forEach((skill) => {
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

            if (Helper.isEmpty(jewelMapping[jewelInfo.size])) {
                jewelMapping[jewelInfo.size] = {}
            }

            if (Helper.isEmpty(jewelMapping[jewelInfo.size][jewelInfo.id])) {
                jewelMapping[jewelInfo.size][jewelInfo.id] = {
                    name: jewelInfo.name,
                    min: 1,
                    max: 1
                }
            }

            jewelInfo.skills.forEach((skill) => {
                let skillInfo = SkillDataset.getInfo(skill.id)

                if (jewelMapping[jewelInfo.size][jewelInfo.id].max < skillInfo.list.length) {
                    jewelMapping[jewelInfo.size][jewelInfo.id].max = skillInfo.list.length
                }
            })
        })

        let armorFactor = _algorithmParams.usingFactor.armor
        let charmFactor = _algorithmParams.usingFactor.charm
        let jewelFactor = _algorithmParams.usingFactor.jewel

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

                {0 !== Object.keys(jewelMapping).length ? Object.keys(jewelMapping).sort((sizeA, sizeB) => {
                    return sizeA > sizeB ? 1 : -1
                }).map((size) => {
                    return (
                        <div key={size} className="col-12 mhc-content">
                            <div className="col-12 mhc-name">
                                <span>{_('jewelFactor')}: [{size}]</span>
                            </div>

                            <div className="col-12 mhc-content">
                                {Object.keys(jewelMapping[size]).sort((jewelIdA, jewelIdB) => {
                                    return _(jewelIdA) > _(jewelIdB) ? 1 : -1
                                }).map((jewelId) => {
                                    let selectLevel = Helper.isNotEmpty(jewelFactor[jewelId])
                                        ? jewelFactor[jewelId] : -1
                                    let diffLevel = jewelMapping[size][jewelId].max - jewelMapping[size][jewelId].min + 1
                                    let levelList = [
                                        { key: -1, value: _('unlimited') },
                                        { key: 0, value: _('exclude') }
                                    ]

                                    let countableEmptyArray = [...Array(diffLevel).keys()]

                                    countableEmptyArray.forEach((data, index) => {
                                        levelList.push({ key: index + 1, value: index + 1 })
                                    })

                                    return (
                                        <div key={jewelId} className="col-6 mhc-value">
                                            <span>{_(jewelMapping[size][jewelId].name)}</span>

                                            <div className="mhc-icons_bundle">
                                                <BasicSelector
                                                    iconName="sort-numeric-asc"
                                                    defaultValue={selectLevel}
                                                    options={levelList} onChange={(event) => {
                                                        States.world.actions.setAlgorithmParamsUsingFactor('jewel', jewelId, parseInt(event.target.value))
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
    }, [data, _algorithmParams, _requiredEquips, _requiredSets, _requiredSkills])
}
