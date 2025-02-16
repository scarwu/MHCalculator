/**
 * Algorithm Setting: Armor Factors
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Libraries
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load State Control
import States from '@/scripts/states'

/**
 * Variables
 */
const armorRareList = [ 5, 6, 7, 8, 9, 10, 11, 12 ]

export default function ArmorFactors(props) {
    const {segment, byRequiredConditions} = props

    /**
     * Hooks
     */
    const _algorithmParams = States.world.hooks.useAlgorithmParams()
    const _requiredEquips = States.world.hooks.useRequiredEquips()
    const _requiredSets = States.world.hooks.useRequiredSets()
    const _requiredSkills = States.world.hooks.useRequiredSkills()

    return useMemo(() => {
        Helper.debug('Component: AlgorithmSetting -> ArmorFactors')

        let armorSeriesMapping = {}
        let skillLevelMapping = {}
        let dataset = ArmorDataset
        let armorFactor = _algorithmParams.usingFactor.armor

        const equipTypes = Object.keys(_requiredEquips).filter((equipType) => {
            if ('weapon' === equipType || 'charm' === equipType) {
                return false
            }

            return Helper.isEmpty(_requiredEquips[equipType])
        })

        if (true === byRequiredConditions) {
            const setIds = _requiredSets.map((set) => {
                return set.id
            })

            dataset = dataset.typesIs(equipTypes).setsIs(setIds)
        }

        dataset.getItems().filter((armorInfo) => {
            let text = _(armorInfo.series)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((armorInfo) => {
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

        if (true === byRequiredConditions) {
            const skillIds = _requiredSkills.map((skill) => {
                skillLevelMapping[skill.id] = skill.level

                return skill.id
            })

            dataset = dataset.typesIs(equipTypes).hasSkills(skillIds)
        }

        dataset.getItems().filter((armorInfo) => {
            let text = _(armorInfo.series)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((armorInfo) => {
            if (false === armorFactor['rare' + armorInfo.rare]) {
                return
            }

            if (true === byRequiredConditions) {
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
            }

            if (Helper.isEmpty(armorSeriesMapping[armorInfo.rare])) {
                armorSeriesMapping[armorInfo.rare] = {}
            }

            armorSeriesMapping[armorInfo.rare][armorInfo.seriesId] = {
                name: armorInfo.series
            }
        })

        if (0 === Object.keys(armorSeriesMapping).length) {
            return false
        }

        return Object.keys(armorSeriesMapping).sort((rareA, rareB) => {
            return rareA > rareB ? 1 : -1
        }).map((rare) => {
            let seriesIds = Object.keys(armorSeriesMapping[rare]).sort((seriesIdA, seriesIdB) => {
                return _(seriesIdA) > _(seriesIdB) ? 1 : -1
            })

            if (0 === seriesIds.length) {
                return false
            }


            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(seriesIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={rare + '_' + blockIndex} className="mhc-item mhc-item-2-step">
                        <div className="col-12 mhc-name">
                            <span>{_('armorFactor')}: R{rare}</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {seriesIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((seriesId) => {
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
            }

            return blocks
        })
    }, [segment, byRequiredConditions, _algorithmParams, _requiredEquips, _requiredSets, _requiredSkills])
}
