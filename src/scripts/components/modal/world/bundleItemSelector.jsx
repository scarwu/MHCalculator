/**
 * Bundle Item Selector
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { useState, useEffect, useCallback, useRef, createRef } from 'react'
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

export default function BundleItemSelector(props) {

    /**
     * Hooks
     */
    const [stateIsShow, updateIsShow] = useState(States.world.getters.isShowBundleItemSelector())
    const [stateReservedBundles, updateReservedBundles] = useState(States.world.getters.getReservedBundles())
    const [stateCurrentEquips, updateCurrentEquips] = useState(States.world.getters.getCurrentEquips())
    const refModal = useRef()
    const refName = useRef()
    const refNameList = useRef(stateReservedBundles.map(() => createRef()))

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribeCommon = States.store.subscribe(() => {
            updateReservedBundles(States.world.getters.getReservedBundles())
            updateCurrentEquips(States.world.getters.getCurrentEquips())

            refNameList.current = States.world.getters.getReservedBundles().map(() => createRef())
        })

        const unsubscribeModal = States.store.subscribe(() => {
            updateIsShow(States.world.getters.isShowBundleItemSelector())
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

        States.world.actions.hideBundleItemSelector()
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

            if (Helper.isNotEmpty(stateCurrentEquips.weapon)
                && 'customWeapon' === stateCurrentEquips.weapon.id
            ) {
                customWeapon = States.world.getters.getCustomWeapon()
            }

            States.world.actions.addReservedBundle({
                id: MD5(JSON.stringify(stateCurrentEquips)),
                name: name,
                equips: stateCurrentEquips,
                customWeapon: customWeapon
            })
        }
    }, [stateCurrentEquips])

    const handleBundlePickUp = useCallback((index) => {
        if (Helper.isNotEmpty(stateReservedBundles[index].customWeapon)) {
            States.world.actions.replaceCustomWeapon(stateReservedBundles[index].customWeapon)
        }

        States.world.actions.replaceCurrentEquips(stateReservedBundles[index].equips)

        States.world.actions.hideBundleItemSelector()
    }, [stateReservedBundles])

    /**
     * Render Functions
     */
    let renderDefaultItem = () => {
        if (Helper.isEmpty(stateCurrentEquips.weapon.id)
            && Helper.isEmpty(stateCurrentEquips.helm.id)
            && Helper.isEmpty(stateCurrentEquips.chest.id)
            && Helper.isEmpty(stateCurrentEquips.arm.id)
            && Helper.isEmpty(stateCurrentEquips.waist.id)
            && Helper.isEmpty(stateCurrentEquips.leg.id)
            && Helper.isEmpty(stateCurrentEquips.charm.id)
        ) {
            return false
        }

        let bundleId = MD5(JSON.stringify(stateCurrentEquips))

        for (let index in stateReservedBundles) {
            if (bundleId === stateReservedBundles[index].id) {
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
                    {Object.keys(stateCurrentEquips).map((equipType, index) => {
                        if (Helper.isEmpty(stateCurrentEquips[equipType])) {
                            return false
                        }

                        let equipInfo = null

                        if ('weapon' === equipType) {
                            if ('customWeapon' === stateCurrentEquips[equipType].id) {
                                equipInfo = States.world.getters.getCustomWeapon()

                                return Helper.isNotEmpty(equipInfo) ? (
                                    <div key={equipType} className="col-6 mhc-value">
                                        <span>{_(equipInfo.name)}: {_(equipInfo.type)}</span>
                                    </div>
                                ) : false
                            }

                            equipInfo = WeaponDataset.getInfo(stateCurrentEquips[equipType].id)
                        } else if ('helm' === equipType
                            || 'chest' === equipType
                            || 'arm' === equipType
                            || 'waist' === equipType
                            || 'leg' === equipType
                        ) {
                            equipInfo = ArmorDataset.getInfo(stateCurrentEquips[equipType].id)
                        } else if ('charm' === equipType) {
                            equipInfo = CharmDataset.getInfo(stateCurrentEquips[equipType].id)
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

    return stateIsShow ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhc-modal">
                <div className="mhc-panel">
                    <span className="mhc-title">{_('bundleList')}</span>

                    <div className="mhc-icons_bundle">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={States.world.actions.hideBundleItemSelector} />
                    </div>
                </div>
                <div className="mhc-list">
                    <div className="mhc-wrapper">
                        {renderDefaultItem()}
                        {stateReservedBundles.map(renderItem)}
                    </div>
                </div>
            </div>
        </div>
    ) : false
}
