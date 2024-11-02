/**
 * Algorithm Setting
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Status from '@/scripts/core/status'
import Helper from '@/scripts/core/helper'

// Load Components
import ArmorFactors from '@/scripts/components/modal/world/algorithmSetting/armorFactors'
import CharmFactors from '@/scripts/components/modal/world/algorithmSetting/charmFactors'
import JewelFactors from '@/scripts/components/modal/world/algorithmSetting/jewelFactors'
import IconButton from '@/scripts/components/ui/iconButton'
import IconSelector from '@/scripts/components/ui/iconSelector'
import IconInput from '@/scripts/components/ui/iconInput'
import BasicSelector from '@/scripts/components/ui/basicSelector'
import BasicInput from '@/scripts/components/ui/basicInput'

// Load State Control
import States from '@/scripts/states'

/**
 * Variables
 */
const getSortList = () => {
    return [
        { key: 'complex',       value: _('complexSort') },
        { key: 'amount',        value: _('amountSort') },
        { key: 'defense',       value: _('defenseSort') },
        { key: 'fire',          value: _('fireSort') },
        { key: 'water',         value: _('waterSort') },
        { key: 'thunder',       value: _('thunderSort') },
        { key: 'ice',           value: _('iceSort') },
        { key: 'dragon',        value: _('dragonSort') }
    ]
}

const getOrderList = () => {
    return [
        { key: 'desc',          value: _('desc') },
        { key: 'asc',           value: _('asc') }
    ]
}

const getModeList = () => {
    return [
        { key: 'all',                   value: _('all') },
        { key: 'armorFactor',           value: _('armorFactor') },
        { key: 'charmFactor',           value: _('charmFactor') },
        { key: 'jewelFactor',           value: _('jewelFactor') },
        { key: 'byRequiredConditions',  value: _('byRequiredConditions') }
    ]
}

const armorRareList = [ 5, 6, 7, 8, 9, 10, 11, 12 ]
const jewelSizeList = [ 1, 2, 3, 4 ]

/**
 * Handler Functions
 */
const handleModeChange = (event) => {
    States.world.actions.showAlgorithmSetting({
        mode: event.target.value
    })
}

const handleLimitChange = (event) => {
    if ('' === event.target.value) {
        return
    }

    let limit = parseInt(event.target.value)

    limit = (false === isNaN(limit)) ? limit : 1

    event.target.value = limit

    States.world.actions.setAlgorithmParamsLimit(limit)
}

const handleSortChange = (event) => {
    States.world.actions.setAlgorithmParamsSort(event.target.value)
}

const handleOrderChange = (event) => {
    States.world.actions.setAlgorithmParamsOrder(event.target.value)
}

const handleStrategyChange = (event) => {
    States.world.actions.setAlgorithmParamsStrategy(event.target.value)
}

export default function AlgorithmSetting(props) {

    /**
     * Hooks
     */
    const [stateAlgorithmParams, updateAlgorithmParams] = useState(States.world.getters.getAlgorithmParams())
    const [stateIsShow, updateIsShow] = useState(States.world.getters.isShowAlgorithmSetting())
    const [stateBypassData, updateBypassData] = useState(States.world.getters.getAlgorithmSettingBypassData())
    const [stateSegment, updateSegment] = useState(null)
    const [stateMode, updateMode] = useState(null)
    const refModal = useRef()

    useEffect(() => {
        if (Helper.isEmpty(stateBypassData)) {
            return
        }

        if (Helper.isEmpty(stateBypassData.mode)) {
            return
        }

        updateMode(stateBypassData.mode)
    }, [stateBypassData])

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeCommon = States.store.subscribe(() => {
            updateAlgorithmParams(States.world.getters.getAlgorithmParams())
        })

        const unsubscribeModal = States.store.subscribe(() => {
            updateIsShow(States.world.getters.isShowAlgorithmSetting())
            updateBypassData(States.world.getters.getAlgorithmSettingBypassData())
        })

        return () => {
            unsubscribeCommon()
            unsubscribeModal()
        }
    }, [])

    /**
     * Handle Functions
     */
    const handleFastWindowClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.world.actions.hideAlgorithmSetting()
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    /**
     * Render Functions
     */
    return stateIsShow ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhc-modal">
                <div className="mhc-panel">
                    <strong>{_('algorithmSetting')}</strong>

                    <div className="mhc-icons_bundle">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                            defaultValue={stateSegment} onChange={handleSegmentInput} />
                        <IconSelector
                            iconName="globe" defaultValue={stateMode}
                            options={getModeList()} onChange={handleModeChange} />
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={States.world.actions.hideAlgorithmSetting} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        <div className="mhc-item mhc-item-2-step">
                            <div className="col-12 mhc-name">
                                <span>{_('strategy')}</span>
                            </div>
                            <div className="col-12 mhc-content">
                                <div className="col-6 mhc-name">
                                    <span>{_('resultLimit')}</span>
                                </div>
                                <div className="col-6 mhc-value">
                                    <BasicInput
                                        iconName="list-alt"
                                        defaultValue={stateAlgorithmParams.limit}
                                        onChange={handleLimitChange} />
                                </div>
                                <div className="col-6 mhc-name">
                                    <span>{_('sortBy')}</span>
                                </div>
                                <div className="col-6 mhc-value">
                                    <BasicSelector
                                        iconName="sort-amount-desc"
                                        defaultValue={stateAlgorithmParams.sort}
                                        options={getSortList()} onChange={handleSortChange} />
                                </div>
                                <div className="col-6 mhc-name">
                                    <span>{_('sortOrder')}</span>
                                </div>
                                <div className="col-6 mhc-value">
                                    <BasicSelector
                                        iconName="sort-amount-desc"
                                        defaultValue={stateAlgorithmParams.order}
                                        options={getOrderList()} onChange={handleOrderChange} />
                                </div>
                            </div>
                        </div>

                        {'all' === stateMode || 'armorFactor' === stateMode || 'byRequiredConditions' === stateMode ? (
                            <div className="mhc-item mhc-item-2-step">
                                <div className="col-12 mhc-name">
                                    <span>{_('armorFactor')}</span>
                                </div>
                                <div className="col-12 mhc-content">
                                    {armorRareList.map((rare) => {
                                        return (
                                            <div key={rare} className="col-6 mhc-value">
                                                <span>{_('rare') + `: ${rare}`}</span>
                                                <div className="mhc-icons_bundle">
                                                    {stateAlgorithmParams.usingFactor.armor['rare' + rare] ? (
                                                        <IconButton
                                                            iconName="star"
                                                            altName={_('exclude')}
                                                            onClick={() => {States.world.actions.setAlgorithmParamsUsingFactor('armor', 'rare' + rare, false)}} />
                                                    ) : (
                                                        <IconButton
                                                            iconName="star-o"
                                                            altName={_('include')}
                                                            onClick={() => {States.world.actions.setAlgorithmParamsUsingFactor('armor', 'rare' + rare, true)}} />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : false}

                        {'all' === stateMode || 'jewelFactor' === stateMode || 'byRequiredConditions' === stateMode ? (
                            <div className="mhc-item mhc-item-2-step">
                                <div className="col-12 mhc-name">
                                    <span>{_('jewelFactor')}</span>
                                </div>
                                <div className="col-12 mhc-content">
                                    {jewelSizeList.map((size) => {
                                        return (
                                            <div key={size} className="col-6 mhc-value">
                                                <span>{_('size') + `: ${size}`}</span>
                                                <div className="mhc-icons_bundle">
                                                    {stateAlgorithmParams.usingFactor.jewel['size' + size] ? (
                                                        <IconButton
                                                            iconName="star"
                                                            altName={_('exclude')}
                                                            onClick={() => {States.world.actions.setAlgorithmParamsUsingFactor('jewel', 'size' + size, false)}} />
                                                    ) : (
                                                        <IconButton
                                                            iconName="star-o"
                                                            altName={_('include')}
                                                            onClick={() => {States.world.actions.setAlgorithmParamsUsingFactor('jewel', 'size' + size, true)}} />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : false}

                        {'all' === stateMode || 'armorFactor' === stateMode || 'byRequiredConditions' === stateMode
                            ? <ArmorFactors segment={stateSegment}
                                byRequiredConditions={'byRequiredConditions' === stateMode} />
                            : false}
                        {'all' === stateMode || 'charmFactor' === stateMode || 'byRequiredConditions' === stateMode
                            ? <CharmFactors segment={stateSegment}
                                byRequiredConditions={'byRequiredConditions' === stateMode} />
                            : false}
                        {'all' === stateMode || 'jewelFactor' === stateMode || 'byRequiredConditions' === stateMode
                            ? <JewelFactors segment={stateSegment}
                                byRequiredConditions={'byRequiredConditions' === stateMode} />
                            : false}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
