/**
 * Petalace Selector Modal
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
import PetalaceDataset from '@/scripts/libraries/rise/dataset/petalace'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconInput from '@/scripts/components/ui/iconInput'

// Load States
import States from '@/scripts/states'

const targetModalKey = 'petalaceSelector'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, dataStore) => {
    if ('playerEquips' === dataStore.target) {
        States.rise.actions.setPlayerEquip(dataStore.equipType, itemId)
    }
}

/**
 * Render Functions
 */
const renderPetalaceItem = (petalaceItem, dataStore) => {
    let classNames = [
        'mhc-item'
    ]

    if (Helper.isEmpty(dataStore.target) || petalaceItem.id !== dataStore.id) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    return (
        <div key={petalaceItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>{_(petalaceItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(dataStore.target) ? (
                        (petalaceItem.id !== dataStore.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(petalaceItem.id, dataStore)
                                }} />
                        ) : (
                            <IconButton
                                iconName="times" altName={_('remove')}
                                onClick={() => {
                                    handleItemPickUp(null, dataStore)
                                }} />
                        )
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                <div className="col-3 mhc-name">
                    <span>{_('rare')}</span>
                </div>
                <div className="col-9 mhc-value">
                    <span>{petalaceItem.rare}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('healthIncrement')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{petalaceItem.health.increment}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('healthObtain')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{petalaceItem.health.obtain}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('attackIncrement')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{petalaceItem.attack.increment}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('attackObtain')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{petalaceItem.attack.obtain}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('defenseIncrement')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{petalaceItem.defense.increment}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('defenseObtain')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{petalaceItem.defense.obtain}</span>
                </div>
            </div>
        </div>
    )
}

export default function PetalaceSelectorModal (props) {

    /**
     * Hooks
     */
    const _modalData = States.common.hooks.useModalData(targetModalKey)
    const _playerEquips = States.rise.hooks.usePlayerEquips()

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

        // Set Id
        dataStore.id = null

        if (Helper.isNotEmpty(dataStore.target)) {
            let equipType = dataStore.equipType
            let idIndex = dataStore.idIndex

            if ('playerEquips' === dataStore.target
                && Helper.isNotEmpty(_playerEquips[equipType])
            ) {
                dataStore.id = _playerEquips[equipType].id
            }
        }

        // Set List
        dataStore.list = PetalaceDataset.getList()

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(dataStore)
    }, [
        _modalData,
        _playerEquips
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
            return renderPetalaceItem(item, stateTempData)
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

                    <span className="mhc-title">{_('petalaceList')}</span>

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