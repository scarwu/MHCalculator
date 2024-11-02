/**
 * Algorithm Setting: Jewel Factors
 *
 * @package     MHW Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/MHWCalculator
 */

import React, { useState, useEffect, useMemo } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Libraries
import JewelDataset from '@/scripts/libraries/world/dataset/jewel'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import BasicSelector from '@/scripts/components/ui/basicSelector'

// Load State Control
import States from '@/scripts/states'

/**
 * Variables
 */
const jewelSizeList = [ 1, 2, 3, 4 ]

export default function JewelFactors(props) {
    const {segment, byRequiredConditions} = props

    /**
     * Hooks
     */
    const [stateAlgorithmParams, updateAlgorithmParams] = useState(States.world.getters.getAlgorithmParams())
    const [stateRequiredSkills, updateRequiredSkills] = useState(States.world.getters.getRequiredSkills())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateAlgorithmParams(States.world.getters.getAlgorithmParams())
            updateRequiredSkills(States.world.getters.getRequiredSkills())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return useMemo(() => {
        Helper.debug('Component: AlgorithmSetting -> JewelFactors')

        let jewelSizeMapping = {}
        let skillLevelMapping = {}
        let dataset = JewelDataset
        let jewelFactor = stateAlgorithmParams.usingFactor.jewel

        if (true === byRequiredConditions) {
            const skillIds = stateRequiredSkills.map((skill) => {
                skillLevelMapping[skill.id] = skill.level

                return skill.id
            })

            dataset = dataset.hasSkills(skillIds, true)
        }

        dataset.getItems().filter((jewelInfo) => {
            let text = _(jewelInfo.name)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((jewelInfo) => {
            if (false === jewelFactor['size' + jewelInfo.size]) {
                return false
            }

            if (true === byRequiredConditions) {
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
            }

            if (Helper.isEmpty(jewelSizeMapping[jewelInfo.size])) {
                jewelSizeMapping[jewelInfo.size] = {}
            }

            if (Helper.isEmpty(jewelSizeMapping[jewelInfo.size][jewelInfo.id])) {
                jewelSizeMapping[jewelInfo.size][jewelInfo.id] = {
                    name: jewelInfo.name,
                    min: 1,
                    max: 1
                }
            }

            jewelInfo.skills.forEach((skill) => {
                let skillInfo = SkillDataset.getInfo(skill.id)

                if (jewelSizeMapping[jewelInfo.size][jewelInfo.id].max < skillInfo.list.length) {
                    jewelSizeMapping[jewelInfo.size][jewelInfo.id].max = skillInfo.list.length
                }
            })
        })

        if (0 === Object.keys(jewelSizeMapping).length) {
            return false
        }

        return Object.keys(jewelSizeMapping).sort((sizeA, sizeB) => {
            return sizeA > sizeB ? 1 : -1
        }).map((size) => {
            let jewelIds = Object.keys(jewelSizeMapping[size]).sort((jewelIdA, jewelIdB) => {
                return _(jewelIdA) > _(jewelIdB) ? 1 : -1
            })

            if (0 === jewelIds.length) {
                return false
            }

            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(jewelIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={size + '_' + blockIndex} className="mhwc-item mhwc-item-2-step">
                        <div className="col-12 mhwc-name">
                            <span>{_('jewelFactor')}: [{size}]</span>
                        </div>

                        <div className="col-12 mhwc-content">
                            {jewelIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((jewelId) => {
                                let selectLevel = Helper.isNotEmpty(jewelFactor[jewelId])
                                    ? jewelFactor[jewelId] : -1
                                let diffLevel = jewelSizeMapping[size][jewelId].max - jewelSizeMapping[size][jewelId].min + 1
                                let levelList = [
                                    { key: -1, value: _('unlimited') },
                                    { key: 0, value: _('exclude') }
                                ]

                                let countableEmptyArray = [...Array(diffLevel).keys()]

                                countableEmptyArray.forEach((data, index) => {
                                    levelList.push({ key: index + 1, value: index + 1 })
                                })

                                return (
                                    <div key={jewelId} className="col-6 mhwc-value">
                                        <span>{_(jewelSizeMapping[size][jewelId].name)}</span>

                                        <div className="mhwc-icons_bundle">
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
            }

            return blocks
        })
    }, [segment, byRequiredConditions, stateAlgorithmParams, stateRequiredSkills])
}
