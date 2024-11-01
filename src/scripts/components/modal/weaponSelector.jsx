/**
 * Weapon Selector Modal
 *
 * @package     Monster Hunter Rise - Calculator
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
import WeaponDataset from '@/scripts/libraries/dataset/weapon'
// import RampageSkillDataset from '@/scripts/libraries/dataset/rampageSkill'
// import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/common/iconButton'
import IconSelector from '@/scripts/components/common/iconSelector'
import IconInput from '@/scripts/components/common/iconInput'
import SharpnessBar from '@/scripts/components/common/sharpnessBar'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleItemPickUp = (itemId, tempData) => {
    if ('playerEquips' === tempData.target) {
        States.setter.setPlayerEquip(tempData.equipType, itemId)
    }

    if ('requiredConditions' === tempData.target) {
        States.setter.setRequiredConditionsEquip(tempData.equipType, itemId)
    }
}

/**
 * Render Functions
 */
const renderWeaponItem = (weaponItem, tempData) => {
    let classNames = [
        'mhrc-item'
    ]

    if (Helper.isEmpty(tempData.target) || weaponItem.id !== tempData.id) {
        classNames.push('mhrc-item-2-step')
    } else {
        classNames.push('mhrc-item-3-step')
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
            <div className="col-12 mhrc-name">
                <span>{_(weaponItem.name)}</span>

                <div className="mhrc-icons_bundle">
                    {Helper.isNotEmpty(tempData.target) ? (
                        (weaponItem.id !== tempData.id) ? (
                            <IconButton
                                iconName="check" altName={_('select')}
                                onClick={() => {
                                    handleItemPickUp(weaponItem.id, tempData)
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
                <div className="col-3 mhrc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhrc-value">
                    <span>{_(weaponItem.series)}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.attack}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.criticalRate}</span>
                </div>

                {Helper.isNotEmpty(weaponItem.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhrc-value mhrc-sharpness">
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

                <div className="col-3 mhrc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhrc-value">
                    <span>{weaponItem.defense}</span>
                </div>

                <div className="col-3 mhrc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-3 mhrc-value">
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
                        <div className="col-3 mhrc-name">
                            <span>{_(weaponItem.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
                            <span>{weaponItem.element.attack.minValue} - {weaponItem.element.attack.maxValue}</span>
                        </div>
                    </Fragment>
                ) : false}

                {Helper.isNotEmpty(weaponItem.element.status) ? (
                    <Fragment>
                        <div className="col-3 mhrc-name">
                            <span>{_(weaponItem.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhrc-value">
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
    const [stateModalData, updateModalData] = useState(States.getter.getModalData('weaponSelector'))
    const [statePlayerEquips, updatePlayerEquips] = useState(States.getter.getPlayerEquips())
    const [stateRequiredConditions, updateRequiredConditions] = useState(States.getter.getRequiredConditions())

    const [stateTempData, updateTempData] = useState(null)
    const [stateFilter, updateFilter] = useState({})

    const refModal = useRef()
    const refSearch = useRef()

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateModalData(States.getter.getModalData('weaponSelector'))
            updatePlayerEquips(States.getter.getPlayerEquips())
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
        let filter = {}

        // Set Id
        tempData.id = null

        if (Helper.isNotEmpty(tempData.target)) {
            let equipType = tempData.equipType

            if ('playerEquips' === tempData.target
                && Helper.isNotEmpty(statePlayerEquips[equipType])
            ) {
                tempData.id = statePlayerEquips[equipType].id
            }

            if ('requiredConditions' === tempData.target
                && Helper.isNotEmpty(stateRequiredConditions.equips)
                && Helper.isNotEmpty(stateRequiredConditions.equips[equipType])
            ) {
                tempData.id = stateRequiredConditions.equips[equipType].id
            }
        }

        // Set List
        tempData.list = WeaponDataset.getList()

        let weaponItem = WeaponDataset.getItem(tempData.id)

        // Set Type List
        tempData.typeList = Constant.weaponTypes.map((type) => {
            return {
                key: type,
                value: _(type)
            }
        })

        // Set Rare List
        tempData.rareList = {}

        tempData.list.forEach((weaponItem) => {
            tempData.rareList[weaponItem.rare] = weaponItem.rare
        })

        tempData.rareList = Object.values(tempData.rareList).reverse().map((rare) => {
            return {
                key: rare,
                value: _('rare') + `: ${rare}`
            }
        })

        // Set Filter
        filter.type = Helper.isNotEmpty(weaponItem) ? weaponItem.type : tempData.typeList[0].key
        filter.rare = Helper.isNotEmpty(weaponItem) ? weaponItem.rare : tempData.rareList[0].key

        window.addEventListener('keydown', handleSearchFocus)

        updateTempData(tempData)
        updateFilter(filter)
    }, [
        stateModalData,
        statePlayerEquips,
        stateRequiredConditions
    ])

    /**
     * Handle Functions
     */
    const handleFastCloseModal = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.setter.hideModal('weaponSelector')

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

    return Helper.isNotEmpty(stateTempData) ? (
        <div className="mhrc-selector" ref={refModal} onClick={handleFastCloseModal}>
            <div className="mhrc-modal">
                <div className="mhrc-panel">
                    <div className="mhrc-icons_bundle-left">
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

                    <span className="mhrc-title">{_('weaponList')}</span>

                    <div className="mhrc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => {
                                States.setter.hideModal('weaponSelector')
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