/**
 * Equips Dispayler: Custom Weapon
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
import JewelDataset from '@/scripts/libraries/world/dataset/jewel'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'
import SetDataset from '@/scripts/libraries/world/dataset/set'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import BasicSelector from '@/scripts/components/ui/basicSelector'
import BasicInput from '@/scripts/components/ui/basicInput'

// Load State Control
import States from '@/scripts/states'

const getTypeList = () => {
    return [
        { key: 'greatSword',        value: _('greatSword') },
        { key: 'longSword',         value: _('longSword') },
        { key: 'swordAndShield',    value: _('swordAndShield') },
        { key: 'dualBlades',        value: _('dualBlades') },
        { key: 'hammer',            value: _('hammer') },
        { key: 'huntingHorn',       value: _('huntingHorn') },
        { key: 'lance',             value: _('lance') },
        { key: 'gunlance',          value: _('gunlance') },
        { key: 'switchAxe',         value: _('switchAxe') },
        { key: 'chargeBlade',       value: _('chargeBlade') },
        { key: 'insectGlaive',      value: _('insectGlaive') },
        { key: 'lightBowgun',       value: _('lightBowgun') },
        { key: 'heavyBowgun',       value: _('heavyBowgun') },
        { key: 'bow',               value: _('bow') }
    ]
}

const getRareList = () => {
    return [
        { key: 1,   value: 1 },
        { key: 2,   value: 2 },
        { key: 3,   value: 3 },
        { key: 4,   value: 4 },
        { key: 5,   value: 5 },
        { key: 6,   value: 6 },
        { key: 7,   value: 7 },
        { key: 8,   value: 8 },
        { key: 9,   value: 9 },
        { key: 10,  value: 10 },
        { key: 11,  value: 11 },
        { key: 12,  value: 12 }
    ]
}

const getSharpnessList = () => {
    return [
        { key: 'red',       value: _('red') },
        { key: 'orange',    value: _('orange') },
        { key: 'yellow',    value: _('yellow') },
        { key: 'green',     value: _('green') },
        { key: 'blue',      value: _('blue') },
        { key: 'white',     value: _('white') },
        { key: 'purple',    value: _('purple') },
    ]
}

const getAttackElementList = () => {
    return [
        { key: 'none',      value: _('none') },
        { key: 'fire',      value: _('fire') },
        { key: 'water',     value: _('water') },
        { key: 'thunder',   value: _('thunder') },
        { key: 'ice',       value: _('ice') },
        { key: 'dragon',    value: _('dragon') }
    ]
}

const getStatusElementList = () => {
    return [
        { key: 'none',      value: _('none') },
        { key: 'poison',    value: _('poison') },
        { key: 'paralysis', value: _('paralysis') },
        { key: 'sleep',     value: _('sleep') },
        { key: 'blast',     value: _('blast') }
    ]
}

const getEldersealList = () => {
    return [
        { key: 'low',       value: _('low') },
        { key: 'medium',    value: _('medium') },
        { key: 'high',      value: _('high') }
    ]
}

const getSlotSizeList = () => {
    return [
        { key: 'none',  value: _('none') },
        { key: 1,       value: 1 },
        { key: 2,       value: 2 },
        { key: 3,       value: 3 },
        { key: 4,       value: 4 }
    ]
}

const getSkillList = () => {
    return [
        { key: 'none', value: _('none') },
        ...SkillDataset.getItems().filter((skillInfo) => {
            return skillInfo.from.weapon
        }).map((skillInfo) => {
            return { key: skillInfo.id, value: _(skillInfo.name) }
        })
    ]
}

const getSetList = () => {
    return [
        { key: 'none', value: _('none') },
        ...SetDataset.getItems().filter((setInfo) => {
            return setInfo.from.weapon
        }).map((setInfo) => {
            return { key: setInfo.id, value: _(setInfo.name) }
        })
    ]
}

const getValue = (value) => {
    if (Helper.isEmpty(value)) {
        return 'none'
    }

    return value
}

const getSharpnessStep = (sharpness) => {
    if (Helper.isEmpty(sharpness)) {
        return 'none'
    }

    for (let step in sharpness.steps) {
        if (0 < sharpness.steps[step]) {
            return step
        }
    }
}

const getElementType = (element) => {
    if (Helper.isEmpty(element)) {
        return 'none'
    }

    return element.type
}

const getSlotSize = (slot) => {
    if (Helper.isEmpty(slot)) {
        return 'none'
    }

    return slot.size
}

const getSkillId = (skill) => {
    if (Helper.isEmpty(skill)) {
        return 'none'
    }

    return skill.id
}

const getSetId = (set) => {
    if (Helper.isEmpty(set)) {
        return 'none'
    }

    return set.id
}

/**
 * Render Functions
 */
const renderJewelOption = (equipType, slotIndex, slotSize, jewelInfo) => {
    let selectorData = {
        equipType: equipType,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: (Helper.isNotEmpty(jewelInfo)) ? jewelInfo.id : null
    }

    let emptySelectorData = {
        equipType: equipType,
        slotIndex: slotIndex,
        slotSize: slotSize,
        jewelId: null
    }

    if (Helper.isEmpty(jewelInfo)) {
        return (
            <div key={`${equipType}:${slotIndex}:${slotSize}`} className="mhc-icons_bundle">
                <IconButton
                    iconName="plus" altName={_('add')}
                    onClick={() => { States.common.actions.showModal('equipItemSelector', selectorData) }} />
            </div>
        )
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}:${slotSize}`}>
            <span>[{jewelInfo.size}] {_(jewelInfo.name)}</span>
            <div className="mhc-icons_bundle">
                <IconButton
                    iconName="exchange" altName={_('change')}
                    onClick={() => { States.common.actions.showModal('equipItemSelector', selectorData) }} />
                <IconButton
                    iconName="times" altName={_('clean')}
                    onClick={() => { States.world.actions.setCurrentEquip(emptySelectorData) }} />
            </div>
        </Fragment>
    )
}

export default function CustomWeapon(props) {

    /**
     * Hooks
     */
    const _customWeapon = States.world.hooks.useCustomWeapon()
    const _currentEquips = States.world.hooks.useCurrentEquips()
    const _requiredEquips = States.world.hooks.useRequiredEquips()

    return useMemo(() => {
        Helper.debug('Component: EquipsDisplayer -> CustomWeapon')

        let equipType = 'weapon'
        let currentEquip = _currentEquips[equipType]
        let requiredEquip = Helper.isNotEmpty(_requiredEquips[equipType])
            ? _requiredEquips[equipType] : null

        let emptySelectorData = {
            equipType: equipType,
            equipId: null
        }

        let isNotRequire = true

        if (Helper.isNotEmpty(requiredEquip)) {
            if ('weapon' === equipType) {
                isNotRequire = Helper.jsonHash({
                    customWeapon: _customWeapon,
                    enhances: currentEquip.enhances
                }) !== Helper.jsonHash({
                    customWeapon: requiredEquip.customWeapon,
                    enhances: requiredEquip.enhances
                })
            } else {
                isNotRequire = currentEquip.id !== requiredEquip.id
            }
        }

        return (
            <div key="customWeapon" className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('customWeapon')}</span>
                    <div className="mhc-icons_bundle">
                        {isNotRequire ? (
                            <IconButton
                                iconName="arrow-left" altName={_('include')}
                                onClick={() => { States.world.actions.setRequiredEquips(equipType, _customWeapon) }} />
                        ) : false}
                        <IconButton
                            iconName="exchange" altName={_('change')}
                            onClick={() => { States.common.actions.showModal('equipItemSelector', emptySelectorData) }} />
                        <IconButton
                            iconName="times" altName={_('clean')}
                            onClick={() => { States.world.actions.setCurrentEquip(emptySelectorData) }} />
                    </div>
                </div>

                <div className="col-12 mhc-content">
                    <div className="col-3 mhc-name">
                        <span>{_('type')}</span>
                    </div>
                    <div className="col-9 mhc-value">
                        <BasicSelector
                            defaultValue={getValue(_customWeapon.type)}
                            options={getTypeList()} onChange={(event) => {
                                let value = ('none' !== event.target.value)
                                    ? event.target.value : null

                                States.world.actions.setCustomWeaponValue('type', value)
                            }} />
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('rare')}</span>
                    </div>
                    <div className="col-3 mhc-value">
                        <BasicSelector
                            defaultValue={getValue(_customWeapon.rare)}
                            options={getRareList()} onChange={(event) => {
                                let value = parseInt(event.target.value)

                                States.world.actions.setCustomWeaponValue('rare', value)
                            }} />
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('attack')}</span>
                    </div>
                    <div className="col-3 mhc-value">
                        <BasicInput
                            key={_customWeapon.attack}
                            defaultValue={_customWeapon.attack} onChange={(event) => {
                                let value = ('' !== event.target.value)
                                    ? parseInt(event.target.value) : 0

                                States.world.actions.setCustomWeaponValue('attack', value)
                            }} />
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('sharpness')}</span>
                    </div>
                    <div className="col-3 mhc-value">
                        {(-1 === ['lightBowgun', 'heavyBowgun', 'bow'].indexOf(_customWeapon.type)) ? (
                            <BasicSelector
                                defaultValue={getSharpnessStep(_customWeapon.sharpness)}
                                options={getSharpnessList()} onChange={(event) => {
                                    let value = ('none' !== event.target.value)
                                        ? event.target.value : null

                                    States.world.actions.setCustomWeaponSharpness(value)
                                }} />
                        ) : false}
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('criticalRate')}</span>
                    </div>
                    <div className="col-3 mhc-value">
                        <BasicInput
                            key={_customWeapon.criticalRate}
                            defaultValue={_customWeapon.criticalRate} onChange={(event) => {
                                let value = ('' !== event.target.value)
                                    ? parseInt(event.target.value) : 0

                                States.world.actions.setCustomWeaponValue('criticalRate', value)
                            }} />
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('elderseal')}</span>
                    </div>
                    <div className="col-3 mhc-value">
                        {('dragon' === getElementType(_customWeapon.element.attack)) ? (
                            <BasicSelector
                                defaultValue={getValue(_customWeapon.elderseal.affinity)}
                                options={getEldersealList()} onChange={(event) => {
                                    let value = ('none' !== event.target.value)
                                        ? event.target.value : null

                                    States.world.actions.setCustomWeaponElderseal(value)
                                }} />
                        ) : false}
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('defense')}</span>
                    </div>
                    <div className="col-3 mhc-value">
                        <BasicInput
                            key={_customWeapon.defense}
                            defaultValue={_customWeapon.defense} onChange={(event) => {
                                let value = ('' !== event.target.value)
                                    ? parseInt(event.target.value) : 0

                                States.world.actions.setCustomWeaponValue('defense', value)
                            }} />
                    </div>
                </div>

                <div className="col-12 mhc-content">
                    <div className="col-3 mhc-name">
                        <span>{_('element')}: 1</span>
                    </div>
                    <div className="col-3 mhc-value">
                        <BasicSelector
                            defaultValue={getElementType(_customWeapon.element.attack)}
                            options={getAttackElementList()} onChange={(event) => {
                                let value = ('none' !== event.target.value)
                                    ? event.target.value : null

                                States.world.actions.setCustomWeaponElementType('attack', value)
                            }} />
                    </div>
                    <div className="col-6 mhc-value">
                        {('none' !== getElementType(_customWeapon.element.attack)) ? (
                            <BasicInput
                                key={_customWeapon.element.attack.minValue}
                                defaultValue={_customWeapon.element.attack.minValue} onChange={(event) => {
                                    let value = ('' !== event.target.value)
                                        ? parseInt(event.target.value) : 0

                                    States.world.actions.setCustomWeaponElementValue('attack', value)
                                }} />
                        ) : false}
                    </div>
                    <div className="col-3 mhc-name">
                        <span>{_('element')}: 2</span>
                    </div>
                    <div className="col-3 mhc-value">
                        <BasicSelector
                            defaultValue={getElementType(_customWeapon.element.status)}
                            options={getStatusElementList()} onChange={(event) => {
                                let value = ('none' !== event.target.value)
                                    ? event.target.value : null

                                States.world.actions.setCustomWeaponElementType('status', value)
                            }} />
                    </div>
                    <div className="col-6 mhc-value">
                        {('none' !== getElementType(_customWeapon.element.status)) ? (
                            <BasicInput
                                key={_customWeapon.element.status.minValue}
                                defaultValue={_customWeapon.element.status.minValue} onChange={(event) => {
                                    let value = ('' !== event.target.value)
                                        ? parseInt(event.target.value) : 0

                                    States.world.actions.setCustomWeaponElementValue('status', value)
                                }} />
                        ) : false}
                    </div>
                </div>

                <div className="col-12 mhc-content">
                    {[...Array(_customWeapon.slots.length + 1 <= 3
                        ? _customWeapon.slots.length + 1 : 3).keys()].map((index) => {
                        return (
                            <Fragment key={index}>
                                <div className="col-3 mhc-name">
                                    <span>{_('slot')}: {index + 1}</span>
                                </div>
                                <div className="col-3 mhc-value">
                                    <BasicSelector
                                        defaultValue={getSlotSize(_customWeapon.slots[index])}
                                        options={getSlotSizeList()} onChange={(event) => {
                                            let value = ('none' !== event.target.value)
                                                ? parseInt(event.target.value) : null

                                            States.world.actions.setCustomWeaponSlot(index, value)
                                        }} />
                                </div>
                                <div className="col-6 mhc-value">
                                    {('none' !== getSlotSize(_customWeapon.slots[index])) ? (
                                        renderJewelOption(
                                            equipType, index,
                                            getSlotSize(_customWeapon.slots[index]),
                                            JewelDataset.getInfo(currentEquip.slotIds[index])
                                        )
                                    ) : false}
                                </div>
                            </Fragment>
                        )
                    })}
                </div>

                <div className="col-12 mhc-content">
                    <div className="col-3 mhc-name">
                        <span>{_('skill')}</span>
                    </div>
                    <div className="col-9 mhc-value">
                        <BasicSelector
                            defaultValue={getSkillId(_customWeapon.skills[0])}
                            options={getSkillList()} onChange={(event) => {
                                let value = ('none' !== event.target.value)
                                    ? event.target.value : null

                                States.world.actions.setCustomWeaponSkill(0, value)
                            }} />
                    </div>

                    <div className="col-3 mhc-name">
                        <span>{_('set')}</span>
                    </div>
                    <div className="col-9 mhc-value">
                        <BasicSelector
                            defaultValue={getSetId(_customWeapon.set)}
                            options={getSetList()} onChange={(event) => {
                                let value = ('none' !== event.target.value)
                                    ? event.target.value : null

                                States.world.actions.setCustomWeaponSet(value)
                            }} />
                    </div>
                </div>
            </div>
        )
    }, [_customWeapon, _currentEquips, _requiredEquips])
}
