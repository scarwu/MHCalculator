/**
 * Condition Options: Equip List
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import WeaponDataset from '@/scripts/libraries/world/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load State Control
import States from '@/scripts/states'

/**
 * Render Functions
 */
const renderEquipItem = (equipType, requiredEquip) => {
    if (Helper.isEmpty(requiredEquip)) {
        return false
    }

    let equipInfo = null

    if ('weapon' === equipType) {
        if ('customWeapon' === requiredEquip.id) {
            return (
                <div key={requiredEquip.id} className="col-12 mhc-content">
                    <div className="col-4 mhc-name">
                        <span>{_(equipType)}</span>
                    </div>
                    <div className="col-8 mhc-value">
                        <span>{_('customWeapon')}: {_(requiredEquip.customWeapon.type)}</span>

                        <div className="mhc-icons_bundle">
                            <IconButton
                                iconName="times" altName={_('clean')}
                                onClick={() => {States.world.actions.setRequiredEquips(equipType, null)}} />
                        </div>
                    </div>
                </div>
            )
        }

        equipInfo = WeaponDataset.getInfo(requiredEquip.id)
    } else if ('helm' === equipType
        || 'chest' === equipType
        || 'arm' === equipType
        || 'waist' === equipType
        || 'leg' === equipType
    ) {
        equipInfo = ArmorDataset.getInfo(requiredEquip.id)
    } else if ('charm' === equipType) {
        equipInfo = CharmDataset.getInfo(requiredEquip.id)
    } else {
        return false
    }

    if (Helper.isEmpty(equipInfo)) {
        return false
    }

    return (
        <div key={equipInfo.id} className="col-12 mhc-content">
            <div className="col-4 mhc-name">
                <span>{_(equipType)}</span>
            </div>
            <div className="col-8 mhc-value">
                <span>{_(equipInfo.name)}</span>

                <div className="mhc-icons_bundle">
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {States.world.actions.setRequiredEquips(equipType, null)}} />
                </div>
            </div>
        </div>
    )
}

export default function EquipList (props) {

    /**
     * Hooks
     */
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: ConditionOptions -> EquipList')

        if (Helper.isEmpty(_requiredConditions.equips)) {
            return false
        }

        return (
            <div className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('equip')}</span>
                </div>

                {Object.keys(_requiredConditions.equips).map((equipType) => {
                    return renderEquipItem(equipType, _requiredConditions.equips[equipType])
                })}
            </div>
        )
    }, [_requiredConditions])
}
