/**
 * Algorithm Setting: Decoration Factors
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
import DecorationDataset from '@/scripts/libraries/world/dataset/decoration'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import BasicSelector from '@/scripts/components/ui/basicSelector'

// Load State Control
import States from '@/scripts/states'

/**
 * Variables
 */
const decorationSizeList = [ 1, 2, 3, 4 ]

export default function DecorationFactors(props) {
    const {segment, byRequiredConditions} = props

    /**
     * Hooks
     */
    const _algorithmParams = States.world.hooks.useAlgorithmParams()
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: AlgorithmSetting -> DecorationFactors')

        let decorationSizeMapping = {}
        let skillLevelMapping = {}
        let dataset = DecorationDataset
        let decorationFactor = _algorithmParams.usingFactor.decoration

        if (true === byRequiredConditions) {
            const skillIds = _requiredConditions.skills.map((skill) => {
                skillLevelMapping[skill.id] = skill.level

                return skill.id
            })

            dataset = dataset.hasSkills(skillIds, true)
        }

        dataset.getItems().filter((decorationInfo) => {
            let text = _(decorationInfo.name)

            if (Helper.isNotEmpty(segment)
                && -1 === text.toLowerCase().search(segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).forEach((decorationInfo) => {
            if (false === decorationFactor['size' + decorationInfo.size]) {
                return false
            }

            if (true === byRequiredConditions) {
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
            }

            if (Helper.isEmpty(decorationSizeMapping[decorationInfo.size])) {
                decorationSizeMapping[decorationInfo.size] = {}
            }

            if (Helper.isEmpty(decorationSizeMapping[decorationInfo.size][decorationInfo.id])) {
                decorationSizeMapping[decorationInfo.size][decorationInfo.id] = {
                    name: decorationInfo.name,
                    min: 1,
                    max: 1
                }
            }

            decorationInfo.skills.forEach((skill) => {
                let skillInfo = SkillDataset.getInfo(skill.id)

                if (decorationSizeMapping[decorationInfo.size][decorationInfo.id].max < skillInfo.list.length) {
                    decorationSizeMapping[decorationInfo.size][decorationInfo.id].max = skillInfo.list.length
                }
            })
        })

        if (0 === Object.keys(decorationSizeMapping).length) {
            return false
        }

        return Object.keys(decorationSizeMapping).sort((sizeA, sizeB) => {
            return sizeA > sizeB ? 1 : -1
        }).map((size) => {
            let decorationIds = Object.keys(decorationSizeMapping[size]).sort((decorationIdA, decorationIdB) => {
                return _(decorationIdA) > _(decorationIdB) ? 1 : -1
            })

            if (0 === decorationIds.length) {
                return false
            }

            let blocks = []

            for (let blockIndex = 0; blockIndex < Math.ceil(decorationIds.length / 10); blockIndex++) {
                blocks.push(
                    <div key={size + '_' + blockIndex} className="mhc-item mhc-item-2-step">
                        <div className="col-12 mhc-name">
                            <span>{_('decorationFactor')}: [{size}]</span>
                        </div>

                        <div className="col-12 mhc-content">
                            {decorationIds.slice(blockIndex * 10, (blockIndex + 1) * 10).map((decorationId) => {
                                let selectLevel = Helper.isNotEmpty(decorationFactor[decorationId])
                                    ? decorationFactor[decorationId] : -1
                                let diffLevel = decorationSizeMapping[size][decorationId].max - decorationSizeMapping[size][decorationId].min + 1
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
                                        <span>{_(decorationSizeMapping[size][decorationId].name)}</span>

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
            }

            return blocks
        })
    }, [segment, byRequiredConditions, _algorithmParams, _requiredConditions])
}
