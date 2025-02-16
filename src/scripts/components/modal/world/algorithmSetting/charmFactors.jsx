/**
 * Algorithm Setting: Charm Factors
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
import CharmDataset from '@/scripts/libraries/world/dataset/charm'

// Load Components
import BasicSelector from '@/scripts/components/ui/basicSelector'

// Load State Control
import States from '@/scripts/states'

/**
 * Variables
 */
const levelMapping = [ 'I', 'II', 'III', 'IV', 'V' ]

export default function CharmFactors(props) {
    const {segment, byRequiredConditions} = props

    /**
     * Hooks
     */
    const _algorithmParams = States.world.hooks.useAlgorithmParams()
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: AlgorithmSetting -> CharmFactors')

        let charmSeriesMapping = {}
        let skillLevelMapping = {}
        let dataset = CharmDataset
        let charmFactor = _algorithmParams.usingFactor.charm

        if (true === byRequiredConditions) {
            if (Helper.isNotEmpty(_requiredConditions.equips.charm)) {
                return false
            }

            const skillIds = _requiredConditions.skills.map((skill) => {
                skillLevelMapping[skill.id] = skill.level

                return skill.id
            })

            dataset = dataset.hasSkills(skillIds)
        }

        dataset.getItems().filter((charmInfo) => {
            let text = _(charmInfo.series)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((charmInfo) => {
            if (true === byRequiredConditions) {
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

        let seriesIds = Object.keys(charmSeriesMapping).sort((seriesIdA, seriesIdB) => {
            return _(seriesIdA) > _(seriesIdB) ? 1 : -1
        })

        if (0 === seriesIds.length) {
            return false
        }

        let blocks = []

        for (let blockIndex = 0; blockIndex < Math.ceil(seriesIds.length / 10); blockIndex++) {
            blocks.push(
                <div key={blockIndex} className="mhc-item mhc-item-2-step">
                    <div className="col-12 mhc-name">
                        <span>{_('charmFactor')}</span>
                    </div>

                    <div className="col-12 mhc-content">
                        {seriesIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((seriesId) => {
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
            )
        }

        return blocks
    }, [segment, byRequiredConditions, _algorithmParams, _requiredConditions])
}
