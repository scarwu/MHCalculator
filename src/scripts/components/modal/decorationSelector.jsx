/**
 * Decoration Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import DecorationDataset from '@/scripts/libraries/dataset/decoration'
import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconInput from '@/scripts/components/common/iconInput'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquipDecoration(tempData.equipType, tempData.idIndex, itemId)
    }
}

/**
 * Render Functions
 */
const renderDecorationItem = (decorationItem, tempData) => {
    let classNames = [
        'mhrc-item'
    ]

    if (Helper.isEmpty(tempData.target) || decorationItem.id !== tempData.id) {
        classNames.push('mhrc-item-2-step')
    } else {
        classNames.push('mhrc-item-3-step')
    }

    return (
        <div key={decorationItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhrc-name">
                <span>[{decorationItem.size}] {_(decorationItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (decorationItem.id !== tempData.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(decorationItem.id, tempData)
                                }} />
                        ) : (
                            <IconButton
                                iconName="times" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(null, tempData)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhrc-content">
                {decorationItem.skills.map((skillData, index) => {
                    let skillItem = SkillDataset.getItem(skillData.id)

                    return Helper.isNotEmpty(skillItem) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhrc-name">
                                <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                            </div>
                            <div className="col-12 mhrc-value mhrc-description">
                                <span>{_(skillItem.list[skillData.level - 1].effect)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

export default function DecorationSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('decorationSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('decorationSelector'))
            updatePlayerEquips(States.getter.getPlayerEquips())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    // Initialize
    useEffect(() => {
        if (Helper.isEmpty(stateModalData)) {
            updateTempData(null)

            window.removeEventListener('keydown', handleSearchFocus)

            return
        }

        let tempData = Helper.deepCopy(stateModalData)

        // Set Id
        tempData.id = null

        if (Helper.isNotEmpty(tempData.target)) {
            let equipType = tempData.equipType
            let idIndex = tempData.idIndex

            if ('playerEquips' === tempData.target
                && Helper.isNotEmpty(statePlayerEquips[equipType])
                && Helper.isNotEmpty(statePlayerEquips[equipType].decorationIds)
                && Helper.isNotEmpty(statePlayerEquips[equipType].decorationIds[idIndex])
            ) {
                tempData.id = statePlayerEquips[equipType].decorationIds[idIndex]
            }
        }

        // Set Size
        if (Helper.isEmpty(tempData.size)) {
            tempData.size = 3
        }

        // Set List
        tempData.list = []

        for (let size = tempData.size; size >= 1; size--) {
            for (let rare = 9; rare >= 1; rare--) {
                tempData.list = tempData.list.concat(DecorationDataset.rareIs(rare).sizeIs(size).getList())
            }
        }

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
    }, [
        stateModalData,
        statePlayerEquips
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('decorationSelector')

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

            item.skills.forEach((skillData) => {
                let skillItem = SkillDataset.getItem(skillData.id)

                if (Helper.isNotEmpty(skillItem)) {
                    text += _(skillItem.name)
                }
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
            return renderDecorationItem(item, stateTempData)
        })
    }, [
        stateTempData,
        stateFilter
    ])

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <div className="mhrc-icons_bundle-left">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            bypassRef={refSearch} defaultValue={stateFilter.segment}
                            onChange={handleSegmentInput} />
                    </div>

                    <span className="mhrc-title">{_('decorationList')}</span>

                    <div className="mhrc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('decorationSelector')
                            }} />
                    </div>
                </div>
                <div className="mhrc-list">
                    <div className="mhrc-wrapper">
                        {getContent}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}