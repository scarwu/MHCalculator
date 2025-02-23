/**
 * Condition Item Selector
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
import SetDataset from '@/scripts/libraries/world/dataset/set'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconSelector from '@/scripts/components/ui/iconSelector'
import IconInput from '@/scripts/components/ui/iconInput'

// Load State Control
import States from '@/scripts/states'

const targetModalKey = 'conditionItemSelector'

/**
 * Handle Functions
 */
const handleModeChange = (event) => {
    States.common.actions.showModal(targetModalKey, {
        mode: event.target.value
    })
}

/**
 * Render Functions
 */
const renderSetItem = (set) => {
    return (
        <div key={set.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>{_(set.name)}</span>

                <div className="mhc-icons_bundle">
                    {set.isSelect ? (
                        <IconButton
                            iconName="minus" altName={_('remove')}
                            onClick={() => {States.world.actions.removeRequiredSet(set.id)}} />
                    ) : (
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {States.world.actions.addRequiredSet(set.id)}} />
                    )}
                </div>
            </div>
            <div className="col-12 mhc-content">
                {set.skills.map((skill, index) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhc-name">
                                <span>({skill.require}) {_(skillInfo.name)} Lv.{skill.level}</span>
                            </div>
                            <div className="col-12 mhc-value mhc-description">
                                <span>{_(skillInfo.list[0].description)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

const renderSkillItem = (skill) => {
    return (
        <div key={skill.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>{_(skill.name)}</span>

                <div className="mhc-icons_bundle">
                    {skill.isSelect ? (
                        <IconButton
                            iconName="minus" altName={_('remove')}
                            onClick={() => {States.world.actions.removeRequiredSkill(skill.id)}} />
                    ) : (
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {States.world.actions.addRequiredSkill(skill.id)}} />
                    )}
                </div>
            </div>
            <div className="col-12 mhc-content">
                {skill.list.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="col-2 mhc-name">
                                {item.isHidden ? (
                                    <span>(Lv.{item.level})</span>
                                ) : (
                                    <span>Lv.{item.level}</span>
                                )}
                            </div>
                            <div className="col-10 mhc-value mhc-description">
                                <span>{_(item.description)}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Sub Components
 */
const SetList = (props) => {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: ConditionItemSelector -> SetList')

        return data.map(renderSetItem)
    }, [data])
}

const SkillList = (props) => {
    const {data} = props

    return useMemo(() => {
        Helper.debug('Component: ConditionItemSelector -> SkillList')

        return data.map(renderSkillItem)
    }, [data])
}

export default function ConditionItemSelector (props) {

    /**
     * Hooks
     */
    const _modalData = States.common.hooks.useModalData(targetModalKey)
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    const [stateMode, updateMode] = useState(null)
    const [stateSortedList, updateSortedList] = useState([])
    const [stateSegment, updateSegment] = useState(null)

    const refModal = useRef(null)

    useEffect(() => {
        if (Helper.isEmpty(_modalData)) {
            return
        }

        let idList = []
        let selectedList = []
        let unselectedList = []

        switch (_modalData.mode) {
        case 'set':
            idList = _requiredConditions.sets.map((set) => {
                return set.id
            })

            SetDataset.getItems().forEach((setInfo) => {
                if (-1 !== idList.indexOf(setInfo.id)) {
                    setInfo.isSelect = true

                    selectedList.push(setInfo)
                } else {
                    setInfo.isSelect = false

                    unselectedList.push(setInfo)
                }
            })

            break
        case 'skill':
            idList = _requiredConditions.skills.map((skill) => {
                return skill.id
            })

            SkillDataset.getItems().forEach((skillInfo) => {
                if (true === skillInfo.from.decoration
                    || true === skillInfo.from.armor
                    || true === skillInfo.from.charm
                ) {
                    if (-1 !== idList.indexOf(skillInfo.id)) {
                        skillInfo.isSelect = true

                        selectedList.push(skillInfo)
                    } else {
                        skillInfo.isSelect = false

                        unselectedList.push(skillInfo)
                    }
                }
            })

            break
        default:
            return
        }

        updateMode(_modalData.mode)
        updateSortedList(selectedList.concat(unselectedList))
    }, [_modalData, _requiredConditions])

    /**
     * Variables
     */
    const getModeList = () => {
        return [
            { key: 'set',   value: _('set') },
            { key: 'skill', value: _('skill') }
        ]
    }

    /**
     * Handle Functions
     */
    const handleFastWindowClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.common.actions.hideModal(targetModalKey)
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    const getContent = useCallback(() => {
        switch (stateMode) {
        case 'set':
            return (
                <SetList data={stateSortedList.filter((set) => {

                    // Create Text
                    let text = _(set.name)

                    set.skills.forEach((set) => {
                        let skillInfo = SkillDataset.getInfo(set.id)

                        if (Helper.isEmpty(skillInfo)) {
                            return
                        }

                        text += _(skillInfo.name) + skillInfo.list.map((item) => {
                            return _(item.description)
                        }).join('')
                    })

                    // Search Nameword
                    if (Helper.isNotEmpty(stateSegment)
                        && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                    ) {
                        return false
                    }

                    return true
                }).sort((dataA, dataB) => {
                    return _(dataA.id) > _(dataB.id) ? 1 : -1
                })} />
            )
        case 'skill':
            return (
                <SkillList data={stateSortedList.filter((skill) => {

                    // Create Text
                    let text = _(skill.name)

                    skill.list.forEach((item) => {
                        text += _(item.name) + _(item.description)
                    })

                    // Search Nameword
                    if (Helper.isNotEmpty(stateSegment)
                        && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                    ) {
                        return false
                    }

                    return true
                }).sort((dataA, dataB) => {
                    return _(dataA.id) > _(dataB.id) ? 1 : -1
                })} />
            )
        default:
            return false
        }
    }, [stateMode, stateSortedList, stateSegment])

    return Helper.isNotEmpty(_modalData) ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhc-modal">
                <div className="mhc-panel">
                    <div className="mhc-icons_bundle-left">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateSegment} onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="globe" defaultValue={stateMode}
                            options={getModeList()} onChange={handleModeChange} />
                    </div>

                    <span className="mhc-title">{_(stateMode + 'List')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.common.actions.hideModal(targetModalKey) }} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        {getContent()}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
