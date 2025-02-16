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
import SetDataset from '@/scripts/libraries/rise/dataset/set'
import ArmorDataset from '@/scripts/libraries/rise/dataset/armor'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconInput from '@/scripts/components/ui/iconInput'

// Load States
import States from '@/scripts/states'

const targetModalKey = 'setSelector'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, action, dataStore) => {
    if ('requiredConditions' === dataStore.target) {
        if ('add' === action) {
            States.rise.actions.addRequiredConditionsSet(itemId)
        }

        if ('remove' === action) {
            States.rise.actions.removeRequiredConditionsSet(itemId)
        }
    }
}

/**
 * Render Functions
 */
const renderSetItem = (setItem, dataStore) => {
    let classNames = [
        'mhc-item'
    ]

    if (-1 === dataStore.ids.indexOf(setItem.id)) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    return (
        <div key={setItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>{_(setItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(dataStore.target) ? (
                        (-1 === dataStore.ids.indexOf(setItem.id)) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(setItem.id, 'add', dataStore)
                                }} />
                        ) : (
                            <IconButton
                                iconName="times" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(setItem.id, 'remove', dataStore)
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
                dataStore.ids = _requiredConditions.sets.map((setData) => {
                    return setData.id
                })
            }
        }

        // Set List
        dataStore.list = SetDataset.getList().filter((setItem) => {
            return 3 <= setItem.items.length
        })

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
