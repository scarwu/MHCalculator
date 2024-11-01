/**
 * Set Selector Modal
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core Libraries
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import SetDataset from '@/scripts/libraries/dataset/set'
import ArmorDataset from '@/scripts/libraries/dataset/armor'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconInput from '@/scripts/components/common/iconInput'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, action, tempData) => {
    if ('requiredConditions' === tempData.target) {
        if ('add' === action) {
            States.setter.addRequiredConditionsSet(itemId)
        }

        if ('remove' === action) {
            States.setter.removeRequiredConditionsSet(itemId)
        }
    }
}

/**
 * Render Functions
 */
const renderSetItem = (setItem, tempData) => {
    let classNames = [
        'mhc-item'
    ]

    if (-1 === tempData.ids.indexOf(setItem.id)) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    return (
        <div key={setItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>{_(setItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (-1 === tempData.ids.indexOf(setItem.id)) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(setItem.id, 'add', tempData)
                                }} />
                        ) : (
                            <IconButton
                                iconName="times" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(setItem.id, 'remove', tempData)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                <div className="col-2 mhc-name">
                    <span>{_('rare')}</span>
                </div>
                <div className="col-4 mhc-value">
                    <span>{setItem.rare}</span>
                </div>

                {setItem.items.map((armorData, index) => {
                    let armorItem = ArmorDataset.getItem(armorData.id)

                    return Helper.isNotEmpty(armorItem) ? (
                        <Fragment key={index}>
                            <div className="col-2 mhc-name">
                                <span>{_(armorItem.type)}</span>
                            </div>
                            <div className="col-4 mhc-value">
                                <span>{_(armorItem.name)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

export default function SetSelectorModal (props) {

    /**
     * Hooks
     */
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('setSelector'))
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('setSelector'))
            updateRequiredConditions(States.getter.getRequiredConditions())
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

        // Set Ids
        tempData.ids = []

        if (Helper.isNotEmpty(tempData.target)) {
            if ('requiredConditions' === tempData.target) {
                tempData.ids = stateRequiredConditions.sets.map((setData) => {
                    return setData.id
                })
            }
        }

        // Set List
        tempData.list = SetDataset.getList().filter((setItem) => {
            return 3 <= setItem.items.length
        })

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
    }, [
        stateModalData,
        stateRequiredConditions
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('setSelector')

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

            // Search Nameword
            if (Helper.isNotEmpty(stateFilter.segment)
                && -1 === text.toLowerCase().search(stateFilter.segment.toLowerCase())
            ) {
                return false
            }

            return true
        }).sort((itemA, itemB) => {
            return _(itemA.rare) > _(itemB.rare) ? 1 : -1
        }).map((item) => {
            return renderSetItem(item, stateTempData)
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

                    <span className="mhc-title">{_('setList')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('setSelector')
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
