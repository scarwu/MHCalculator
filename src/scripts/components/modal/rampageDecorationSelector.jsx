/**
 * RampageDecoration Selector Modal
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
import RampageDecorationDataset from '@/scripts/libraries/dataset/rampageDecoration'
import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconInput from '@/scripts/components/ui/iconInput'

// Load States
import States from '@/scripts/states'

const targetModalKey = 'rampageDecorationSelector'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, dataStore) => {
    if ('playerEquips' === dataStore.target) {
        States.actions.setPlayerEquipRampageDecoration(dataStore.equipType, dataStore.idIndex, itemId)
    }
}

/**
 * Render Functions
 */
const renderRampageDecorationItem = (rampageDecorationItem, dataStore) => {
    let classNames = [
        'mhc-item'
    ]

    if (Helper.isEmpty(dataStore.target) || rampageDecorationItem.id !== dataStore.id) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    return (
        <div key={rampageDecorationItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>[{rampageDecorationItem.size}] {_(rampageDecorationItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(dataStore.target) ? (
                        (rampageDecorationItem.id !== dataStore.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(rampageDecorationItem.id, dataStore)
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
                {Helper.isNotEmpty(rampageDecorationItem.skill) ? (
                    <Fragment key={index}>
                        <div className="col-12 mhc-name">
                            <span>{_(rampageDecorationItem.skill.name)} Lv.{skillData.level}</span>
                        </div>
                        <div className="col-12 mhc-value mhc-description">
                            <span>{_(rampageDecorationItem.skill.list[skillData.level - 1].effect)}</span>
                        </div>
                    </Fragment>
                ) : false}
            </div>
        </div>
    )
}

export default function RampageDecorationSelectorModal (props) {

    /**
     * Hooks
     */
    const _modalData = States.hooks.useModalData(targetModalKey)
    const _playerEquips = States.hooks.usePlayerEquips()

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
                && Helper.isNotEmpty(_playerEquips[equipType].rampageDecorationIds)
                && Helper.isNotEmpty(_playerEquips[equipType].rampageDecorationIds[idIndex])
            ) {
                dataStore.id = _playerEquips[equipType].rampageDecorationIds[idIndex]
            }
        }

        // Set Size
        if (Helper.isEmpty(dataStore.size)) {
            dataStore.size = 3
        }

        // Set List
        dataStore.list = []

        for (let size = dataStore.size; size >= 1; size--) {
            for (let rare = 9; rare >= 1; rare--) {
                dataStore.list = dataStore.list.concat(RampageDecorationDataset.rareIs(rare).sizeIs(size).getList())
            }
        }

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

        States.actions.hideModal(targetModalKey)

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
            return renderRampageDecorationItem(item, stateTempData)
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

                    <span className="mhc-title">{_('rampageDecorationList')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.actions.hideModal(targetModalKey)
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