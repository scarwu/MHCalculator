/**
 * Bundle Item Selector
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, createRef } from 'react'
import MD5 from 'md5'

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import WeaponDataset from '@/scripts/libraries/world/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import BasicInput from '@/scripts/components/ui/basicInput'

// Load State Control
import States from '@/scripts/states'

const targetModalKey = 'bundleItemSelector'

export default function BundleItemSelector(props) {

    /**
     * Hooks
     */
    const _modalData = States.common.hooks.useModalData(targetModalKey)
    const _reservedBundles = States.world.hooks.useReservedBundles()
    const _currentEquips = States.world.hooks.useCurrentEquips()

    const refModal = useRef(null)
    const refName = useRef(null)
    const refNameList = useRef(_reservedBundles.map(() => createRef()))

    // Initialize
    useEffect(() => {
        if (Helper.isNotEmpty(_modalData)) {
            // pass
        } else {
            // pass
        }
    }, [_modalData])

    useEffect(() => {
        refNameList.current = _reservedBundles.map(() => createRef())
    }, [ _reservedBundles ])

    /**
     * Handle Functions
     */
    const handleFastWindowClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.common.actions.hideModal(targetModalKey)
    }, [])

    const handleBundleSave = useCallback((index) => {
        let name = Helper.isNotEmpty(index)
            ? refNameList.current[index].current.value
            : refName.current.value

        if (0 === name.length) {
            return
        }

        if (Helper.isNotEmpty(index)) {
            States.world.actions.updateReservedBundleName(index, name)
        } else {
            let customWeapon = null

            if (Helper.isNotEmpty(_currentEquips.weapon)
                && 'customWeapon' === _currentEquips.weapon.id
            ) {
                customWeapon = States.world.getters.customWeapon()
            }

            States.world.actions.addReservedBundle({
                id: MD5(JSON.stringify(_currentEquips)),
                name: name,
                equips: _currentEquips,
                customWeapon: customWeapon
            })
        }
    }, [_currentEquips])

    const handleBundlePickUp = useCallback((index) => {
        if (Helper.isNotEmpty(_reservedBundles[index].customWeapon)) {
            States.world.actions.replaceCustomWeapon(_reservedBundles[index].customWeapon)
        }

        States.world.actions.replaceCurrentEquips(_reservedBundles[index].equips)

        States.common.actions.hideModal(targetModalKey)
    }, [_reservedBundles])

    /**
     * Render Functions
     */
    let renderDefaultItem = () => {
        if (Helper.isEmpty(_currentEquips.weapon.id)
            && Helper.isEmpty(_currentEquips.helm.id)
            && Helper.isEmpty(_currentEquips.chest.id)
            && Helper.isEmpty(_currentEquips.arm.id)
            && Helper.isEmpty(_currentEquips.waist.id)
            && Helper.isEmpty(_currentEquips.leg.id)
            && Helper.isEmpty(_currentEquips.charm.id)
        ) {
            return false
        }

        let bundleId = MD5(JSON.stringify(_currentEquips))

        for (let index in _reservedBundles) {
            if (bundleId === _reservedBundles[index].id) {
                return false
            }
        }

        return (
            <div key={bundleId} className="mhc-item mhc-item-2-step">
                <div className="col-12 mhc-name">
                    <BasicInput placeholder={_('inputName')} bypassRef={refName} />

                    <div className="mhc-icons_bundle">
                        <IconButton
                            iconName="floppy-o" altName={_('save')}
                            onClick={() => {handleBundleSave(null)}} />
                    </div>
                </div>

                <div className="col-12 mhc-content">
                    {Object.keys(_currentEquips).map((equipType, index) => {
                        if (Helper.isEmpty(_currentEquips[equipType])) {
                            return false
                        }

                        let equipInfo = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === _currentEquips[equipType].id) {
                                equipInfo = States.world.getters.customWeapon()

                                return Helper.isNotEmpty(equipInfo) ? (
                                    <div key={equipType} className="col-6 mhc-value">
                                        <span>{_(equipInfo.name)}: {_(equipInfo.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipInfo = WeaponDataset.getInfo(_currentEquips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipInfo = ArmorDataset.getInfo(_currentEquips[equipType].id)
                        } else if ('charm' === equipType) {
                            equipInfo = CharmDataset.getInfo(_currentEquips[equipType].id)
                        }

                        return Helper.isNotEmpty(equipInfo) ? (
                            <div key={index} className="col-6 mhc-value">
                                <span>{_(equipInfo.name)}</span>
                            </div>
                        ) : false
                    })}
                </div>
            </div>
        )
    }

    let renderItem = (data, index) => {
        return (
            <div key={`${data.id}:${index}`} className="mhc-item mhc-item-2-step">
                <div className="col-12 mhc-name">
                    <BasicInput placeholder={_('inputName')} defaultValue={data.name}
                        bypassRef={refNameList.current[index]} />

                    <div className="mhc-icons_bundle">
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleBundlePickUp(index)}} />
                        <IconButton
                            iconName="times" altName={_('remove')}
                            onClick={() => {States.world.actions.removeReservedBundle(index)}} />
                        <IconButton
                            iconName="floppy-o" altName={_('save')}
                            onClick={() => {handleBundleSave(index)}} />
                    </div>
                </div>
                <div className="col-12 mhc-content">
                    {Object.keys(data.equips).map((equipType, index) => {
                        if (Helper.isEmpty(data.equips[equipType])) {
                            return false
                        }

                        let equipInfo = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === data.equips[equipType].id) {
                                equipInfo = data.customWeapon

                                return Helper.isNotEmpty(equipInfo) ? (
                                    <div key={equipType} className="col-6 mhc-value">
                                        <span>{_(equipInfo.name)}: {_(equipInfo.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipInfo = WeaponDataset.getInfo(data.equips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipInfo = ArmorDataset.getInfo(data.equips[equipType].id)
                        } else if ('charm' === equipType) {
                            equipInfo = CharmDataset.getInfo(data.equips[equipType].id)
                        }

                        return Helper.isNotEmpty(equipInfo) ? (
                            <div key={index} className="col-6 mhc-value">
                                <span>{_(equipInfo.name)}</span>
                            </div>
                        ) : false
                    })}
                </div>
            </div>
        )
    }

    return Helper.isNotEmpty(_modalData) ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhc-modal">
                <div className="mhc-panel">
                    <span className="mhc-title">{_('bundleList')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.common.actions.hideModal(targetModalKey) }} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        {renderDefaultItem()}
                        {_reservedBundles.map(renderItem)}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
