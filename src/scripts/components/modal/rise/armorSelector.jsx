/**
 * Armor Selector Modal
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import ArmorDataset from '@/scripts/libraries/rise/dataset/armor'
import SkillDataset from '@/scripts/libraries/rise/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconSelector from '@/scripts/components/ui/iconSelector'
import IconInput from '@/scripts/components/ui/iconInput'

// Load States
import States from '@/scripts/states'

const targetModalKey = 'armorSelector'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, dataStore) => {
    if ('playerEquips' === dataStore.target) {
        States.rise.actions.setPlayerEquip(dataStore.equipType, itemId)
    }

    if ('requiredConditions' === dataStore.target) {
        States.rise.actions.setRequiredConditionsEquip(dataStore.equipType, itemId)
    }

    States.common.actions.showModal('armorSelector', {
        target: dataStore.target,
        equipType: dataStore.equipType
    })
}

/**
 * Render Functions
 */
const renderArmorItem = (armorItem, dataStore) => {
    let classNames = [
        'mhc-item'
    ]

    if (Helper.isEmpty(dataStore.target) || armorItem.id !== dataStore.id) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    if (Helper.isEmpty(armorItem.maxDefense)) {
        armorItem.maxDefense = '?'
    }

    return (
        <div key={armorItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>{_(armorItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(dataStore.target) ? (
                        (armorItem.id !== dataStore.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(armorItem.id, dataStore)
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
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhc-value">
                    <span>{_(armorItem.series)}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{armorItem.minDefense} - {armorItem.maxDefense}</span>
                </div>

                {Constant.resistanceTypes.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhc-value">
                                <span>{armorItem.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}

                <div className="col-3 mhc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-9 mhc-value">
                    {(Helper.isNotEmpty(armorItem.slots) && 0 !== armorItem.slots.length) ? (
                        armorItem.slots.map((slotData, index) => {
                            return (
                                <span key={index}>[{slotData.size}]</span>
                            )
                        })
                    ) : false}
                </div>

                {(Helper.isNotEmpty(armorItem.skills) && 0 !== armorItem.skills.length) ? (
                    armorItem.skills.map((skillData, index) => {
                        let skillItem = SkillDataset.getItem(skillData.id)

                        return Helper.isNotEmpty(skillItem) ? (
                            <Fragment key={index}>
                                <div className="col-12 mhc-name">
                                    <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                                </div>
                                <div className="col-12 mhc-value mhc-description">
                                    <span>{_(skillItem.list[skillData.level - 1].effect)}</span>
                                </div>
                            </Fragment>
                        ) : false
                    })
                ): false}
            </div>
        </div>
    )
}

export default function ArmorSelectorModal (props) {

    /**
     * Hooks
     */
    const _modalData = States.common.hooks.useModalData(targetModalKey)
    const _playerEquips = States.rise.hooks.usePlayerEquips()
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
        let filter = {}

        // Set Id
        dataStore.id = null

        if (Helper.isNotEmpty(dataStore.target)) {
            let equipType = dataStore.equipType

            if ('playerEquips' === dataStore.target
                && Helper.isNotEmpty(_playerEquips[equipType])
            ) {
                dataStore.id = _playerEquips[equipType].id
            }

            if ('requiredConditions' === dataStore.target
                && Helper.isNotEmpty(_requiredConditions.equips)
                && Helper.isNotEmpty(_requiredConditions.equips[equipType])
            ) {
                dataStore.id = _requiredConditions.equips[equipType].id
            }
        }

        // Set List
        dataStore.list = ArmorDataset.getList()

        let armorItem = ArmorDataset.getItem(dataStore.id)

        // Set Type List
        dataStore.typeList = Constant.armorTypes.map((type) => {
            return {
                key: type,
                value: _(type)
            }
        })

        // Set Rare List
        dataStore.rareList = {}

        dataStore.list.forEach((armorItem) => {
            dataStore.rareList[armorItem.rare] = armorItem.rare
        })

        dataStore.rareList = Object.values(dataStore.rareList).reverse().map((rare) => {
            return {
                key: rare,
                value: _('rare') + `: ${rare}`
            }
        })

        // Set Filter
        filter.type = Helper.isNotEmpty(armorItem) ? armorItem.type : null
        filter.rare = (Helper.isNotEmpty(armorItem)) ? armorItem.rare : dataStore.rareList[0].key

        if (Helper.isNotEmpty(_modalData.equipType) && Helper.isEmpty(filter.type)) {
            filter.type = _modalData.equipType
        }

        if (Helper.isEmpty(filter.type)) {
            filter.type = dataStore.typeList[0].key
        }

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(dataStore)
        updateFilter(filter)
    }, [
        _modalData,
        _playerEquips,
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

    const handleTypeChange = useCallback((event) => {
        let type = event.target.value

        if (Helper.isNotEmpty(stateTempData.target)) {
            States.common.actions.showModal(targetModalKey, {
                target: stateTempData.target,
                equipType: type
            })
        }

        updateFilter(Object.assign({}, stateFilter, {
            type: type
        }))
    }, [
        stateTempData,
        stateFilter
    ])

    const handleRareChange = useCallback((event) => {
        let rare = event.target.value

        updateFilter(Object.assign({}, stateFilter, {
            rare: parseInt(rare, 10)
        }))
    }, [stateFilter])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(stateTempData)) {
            return false
        }

        return stateTempData.list.filter((item) => {
            if (item.type !== stateFilter.type) {
                return false
            }

            if (item.rare !== stateFilter.rare) {
                return false
            }

            // Create Text
            let text = _(item.name)
            text += _(item.series)

            if (Helper.isNotEmpty(item.skills)) {
                item.skills.forEach((skillData) => {
                    let skillItem = SkillDataset.getItem(skillData.id)

                    if (Helper.isNotEmpty(skillItem)) {
                        text += _(skillItem.name)
                    }
                })
            }

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
            return renderArmorItem(item, stateTempData)
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
                        <IconSelector
                            iconName="filter" defaultValue={stateFilter.type}
                            options={stateTempData.typeList} onChange={handleTypeChange} />
                        <IconSelector
                            iconName="filter" defaultValue={stateFilter.rare}
                            options={stateTempData.rareList} onChange={handleRareChange} />
                    </div>

                    <span className="mhc-title">{_('armorList')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.common.actions.showModal(targetModalKey) }} />
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