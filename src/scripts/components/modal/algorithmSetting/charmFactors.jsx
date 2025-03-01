/**
 * Algorithm Setting: Charm Factors
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

import React, { useState, useEffect, useMemo } from 'react'

// Load Core
import _ from 'core/lang'
import Status from 'core/status'
import Helper from 'core/helper'

// Load Libraries
import CharmDataset from 'libraries/dataset/charm'

// Load Components
import BasicSelector from 'components/ui/basicSelector'

// Load States
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
    const [stateAlgorithmParams, updateAlgorithmParams] = useState(States.getters.getAlgorithmParams())
    const [stateRequiredEquips, updateRequiredEquips] = useState(States.getters.getRequiredEquips())
    const [stateRequiredSkills, updateRequiredSkills] = useState(States.getters.getRequiredSkills())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateAlgorithmParams(States.getters.getAlgorithmParams())
            updateRequiredEquips(States.getters.getRequiredEquips())
            updateRequiredSkills(States.getters.getRequiredSkills())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return useMemo(() => {
        Helper.debug('Component: AlgorithmSetting -> CharmFactors')

        let charmSeriesMapping = {}
        let skillLevelMapping = {}
        let charmFactor = stateAlgorithmParams.usingFactor.charm
        let filter = {}

        if (true === byRequiredConditions) {
            if (Helper.isNotEmpty(stateRequiredEquips.charm)) {
                return false
            }

            filter.skillIds = stateRequiredSkills.map((skill) => {
                skillLevelMapping[skill.id] = skill.level

                return skill.id
            })
        }

        CharmDataset.getList(filter).filter((charmInfo) => {
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
                <div key={blockIndex} className="mhwc-item mhwc-item-2-step">
                    <div className="col-12 mhwc-name">
                        <span>{_('charmFactor')}</span>
                    </div>

                    <div className="col-12 mhwc-content">
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
                                <div key={seriesId} className="col-6 mhwc-value">
                                    <span>{_(charmSeriesMapping[seriesId].series)}</span>
                                    <div className="mhwc-icons_bundle">
                                        <BasicSelector
                                            iconName="sort-numeric-asc"
                                            defaultValue={selectLevel}
                                            options={levelList} onChange={(event) => {
                                                States.setter.setAlgorithmParamsUsingFactor('charm', seriesId, parseInt(event.target.value))
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
    }, [segment, byRequiredConditions, stateAlgorithmParams, stateRequiredSkills])
}
