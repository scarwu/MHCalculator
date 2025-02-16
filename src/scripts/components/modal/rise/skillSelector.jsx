/**
 * Skill Selector Modal
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
import SkillDataset from '@/scripts/libraries/rise/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconInput from '@/scripts/components/ui/iconInput'

// Load States
import States from '@/scripts/states'

const targetModalKey = 'skillSelector'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, action, dataStore) => {
    if ('requiredConditions' === dataStore.target) {
        if ('add' === action) {
            States.rise.actions.addRequiredConditionsSkill(itemId)
        }

        if ('remove' === action) {
            States.rise.actions.removeRequiredConditionsSkill(itemId)
        }
    }
}

/**
 * Render Functions
 */
const renderSkillItem = (skillItem, dataStore) => {
    let classNames = [
        'mhc-item'
    ]

    if (-1 === dataStore.ids.indexOf(skillItem.id)) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    return (
        <div key={skillItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>{_(skillItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(dataStore.target) ? (
                        (-1 === dataStore.ids.indexOf(skillItem.id)) ? (
                            <IconButton
                                iconName="plus" altName={_('add')}
                                onClick={() => {
                                    handleItemPickUp(skillItem.id, 'add', dataStore)
                                }} />
                        ) : (
                            <IconButton
                                iconName="minus" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(skillItem.id, 'remove', dataStore)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                {skillItem.list.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="col-2 mhc-name">
                                <span>Lv.{item.level}</span>
                            </div>
                            <div className="col-10 mhc-value mhc-description">
                                <span>{_(item.effect)}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default function SkillSelectorModal (props) {

    /**
     * Hooks
     */
    const _modalData = States.common.hooks.useModalData(targetModalKey)
    const _requiredConditions = States.rise.hooks.useRequiredConditions()

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef(null)
    const refSearch = useRef(null)

    // Initialize
    useEffect(() => {
        if (Helper.isEmpty(_modalData)) {
            updateTempData(null)

            window.removeEventListener('keydown', handleSearchFocus)

            return
        }

        let dataStore = Helper.deepCopy(_modalData)

        // Set Ids
        dataStore.ids = []

        if (Helper.isNotEmpty(dataStore.target)) {
            if ('requiredConditions' === dataStore.target) {
                dataStore.ids = _requiredConditions.skills.map((setData) => {
                    return setData.id
                })
            }
        }

        // Set List
        dataStore.list = SkillDataset.getList()

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(dataStore)
    }, [
        _modalData,
        _requiredConditions
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.common.actions.showModal(targetModalKey)

        updateFilter({})
    }, [])

    const handleSearchFocus = useCallback((event) => {
        if ('f' !== event.key || true !== event.ctrlKey) {
            return
        }

        event.preventDefault()

        refSearch.current.focus()
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        updateFilter(Object.assign({}, stateFilter, {
            segment: (0 !== segment.length)
                ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null
        }))
    }, [stateFilter])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        return stateTempData.list.filter((item) => {

            // Create Text
            let text = _(item.name)

            item.list.forEach((skillData) => {
                text += _(skillData.name) + _(skillData.effect)
            })

            // Search Nameword
            if (Helper.isNotEmpty(stateFilter.segment)
                && -1 === text.toLowerCase().search(stateFilter.segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.id) > _(itemB.id) ? 1 : -1
        }).map((item) => {
            return renderSkillItem(item, stateTempData)
        })
    }, [
        stateTempData,
        stateFilter
    ])

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhc-modal">
                <div className="mhc-panel">
                    <div className="mhc-icons_bundle-left">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            bypassRef={refSearch} defaultValue={stateFilter.segment}
                            onChange={handleSegmentInput} />
                    </div>

                    <span className="mhc-title">{_('skillList')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.common.actions.showModal(targetModalKey)
                            }} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        {getContent}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
