/**
 * Weapon Selector Modal
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
import WeaponDataset from '@/scripts/libraries/rise/dataset/weapon'
// import RampageSkillDataset from '@/scripts/libraries/rise/dataset/rampageSkill'
// import SkillDataset from '@/scripts/libraries/rise/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconSelector from '@/scripts/components/ui/iconSelector'
import IconInput from '@/scripts/components/ui/iconInput'
import SharpnessBar from '@/scripts/components/ui/sharpnessBar'

// Load States
import States from '@/scripts/states'

const targetModalKey = 'weaponSelector'

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
}

/**
 * Render Functions
 */
const renderWeaponItem = (weaponItem, dataStore) => {
    let classNames = [
        'mhc-item'
    ]

    if (Helper.isEmpty(dataStore.target) || weaponItem.id !== dataStore.id) {
        classNames.push('mhc-item-2-step')
    } else {
        classNames.push('mhc-item-3-step')
    }

    if (Helper.isNotEmpty(weaponItem.element.attack)
        && Helper.isEmpty(weaponItem.element.attack.maxValue)
    ) {
        weaponItem.element.attack.maxValue = '?'
    }

    if (Helper.isNotEmpty(weaponItem.element.status)
        && Helper.isEmpty(weaponItem.element.status.maxValue)
    ) {
        weaponItem.element.status.maxValue = '?'
    }

    return (
        <div key={weaponItem.id} className={classNames.join(' ')}>
            <div className="col-12 mhc-name">
                <span>{_(weaponItem.name)}</span>

                <div className="mhc-icons_bundle">
                    {Helper.isNotEmpty(dataStore.target) ? (
                        (weaponItem.id !== dataStore.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(weaponItem.id, dataStore)
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
                    <span>{_(weaponItem.series)}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{weaponItem.attack}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{weaponItem.criticalRate}</span>
                </div>

                {Helper.isNotEmpty(weaponItem.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhc-value mhc-sharpness">
                            <SharpnessBar data={{
                                value: weaponItem.sharpness.minValue,
                                steps: weaponItem.sharpness.steps
                            }} />
                            <SharpnessBar data={{
                                value: weaponItem.sharpness.maxValue,
                                steps: weaponItem.sharpness.steps
                            }} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{weaponItem.defense}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-3 mhc-value">
                    {(Helper.isNotEmpty(weaponItem.slots) && 0 !== weaponItem.slots.length) ? (
                        weaponItem.slots.map((slotData, index) => {
                            return (
                                <span key={index}>[{slotData.size}]</span>
                            )
                        })
                    ) : false}
                </div>

                {Helper.isNotEmpty(weaponItem.element.attack) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_(weaponItem.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            <span>{weaponItem.element.attack.minValue} - {weaponItem.element.attack.maxValue}</span>
                        </div>
                    </Fragment>
                ) : false}

                {Helper.isNotEmpty(weaponItem.element.status) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_(weaponItem.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            <span>{weaponItem.element.status.minValue} - {weaponItem.element.status.maxValue}</span>
                        </div>
                    </Fragment>
                ) : false}
            </div>
        </div>
    )
}

export default function WeaponSelectorModal (props) {

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
        dataStore.list = WeaponDataset.getList()

        let weaponItem = WeaponDataset.getItem(dataStore.id)

        // Set Type List
        dataStore.typeList = Constant.weaponTypes.map((type) => {
            return {
                key: type,
                value: _(type)
            }
        })

        // Set Rare List
        dataStore.rareList = {}

        dataStore.list.forEach((weaponItem) => {
            dataStore.rareList[weaponItem.rare] = weaponItem.rare
        })

        dataStore.rareList = Object.values(dataStore.rareList).reverse().map((rare) => {
            return {
                key: rare,
                value: _('rare') + `: ${rare}`
            }
        })

        // Set Filter
        filter.type = Helper.isNotEmpty(weaponItem) ? weaponItem.type : dataStore.typeList[0].key
        filter.rare = Helper.isNotEmpty(weaponItem) ? weaponItem.rare : dataStore.rareList[0].key

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

        updateFilter(Object.assign({}, stateFilter, {
            // equipType: type,
            type: type
        }))
    }, [stateFilter])

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
            text += _(item.type)

            if (Helper.isNotEmpty(item.element)
                && Helper.isNotEmpty(item.element.attack)
            ) {
                text += _(item.element.attack.type)
            }

            if (Helper.isNotEmpty(item.element)
                && Helper.isNotEmpty(item.element.status)
            ) {
                text += _(item.element.status.type)
            }

            // item.skills.forEach((skillData) => {
            //     let skillItem = SkillDataset.getItem(skillData.id)

            //     if (Helper.isNotEmpty(skillItem)) {
            //         text += _(skillItem.name)
            //     }
            // })

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
            return renderWeaponItem(item, stateTempData)
        })
    }, [
        stateTempData, stateFilter
    ])

    return Helper.isNotEmpty(_modalData) ? (
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

                    <span className="mhc-title">{_('weaponList')}</span>

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