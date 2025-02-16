/**
 * Equips Displayer
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Config & Constant
import Config from '@/scripts/config'
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/rise/misc'
import DecorationDataset from '@/scripts/libraries/rise/dataset/decoration'
import SkillDataset from '@/scripts/libraries/rise/dataset/skill'
// import RampageDecorationDataset from '@/scripts/libraries/rise/dataset/rampageDecoration'
import RampageSkillDataset from '@/scripts/libraries/rise/dataset/rampageSkill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconTab from '@/scripts/components/ui/iconTab'
import SharpnessBar from '@/scripts/components/ui/sharpnessBar'
import CustomWeapon from '@/scripts/components/ui/rise/customWeapon'
import CustomCharm from '@/scripts/components/ui/rise/customCharm'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleEquipsDisplayerRefresh = () => {
    States.rise.actions.cleanPlayerEquips()
}

const handleSwitchDataStore = (index) => {
    States.rise.actions.switchDataStore('playerEquips', index)
}

/**
 * Render Functions
 */
 const renderRampageSkillOption = (rampageSkillIndex, rampageSkillId) => {

    // Get RampageSkill Item
    let rampageSkillItem = RampageSkillDataset.getItem(rampageSkillId)

    const showModal = () => {
        States.common.actions.showModal('rampageSkillSelector', {
            target: 'playerEquips',
            idIndex: rampageSkillIndex
        })
    }

    const removeItem = () => {
        States.rise.actions.setPlayerEquipRampageSkill('weapon', rampageSkillIndex, null)
    }

    return (
        <Fragment key={`weapon:${rampageSkillIndex}`}>
            <div className="col-3 mhc-name">
                <span>{_('rampageSkill')}: {rampageSkillIndex + 1}</span>
            </div>
            <div className="col-9 mhc-value">
                {Helper.isNotEmpty(rampageSkillItem) ? (
                    <Fragment>
                        <span>{_(rampageSkillItem.name)}</span>

                        <div className="mhc-icons_bundle">
                            <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                            <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                        </div>
                    </Fragment>
                ) : (
                    <div className="mhc-icons_bundle">
                        <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                    </div>
                )}
            </div>
        </Fragment>
    )
}

const renderDecorationOption = (equipType, slotIndex, slotSize, decorationId) => {

    // Get Decoration Item
    let decorationItem = DecorationDataset.getItem(decorationId)

    const showModal = () => {
        States.common.actions.showModal('decorationSelector', {
            target: 'playerEquips',
            equipType: equipType,
            idIndex: slotIndex,

            // filter
            size: slotSize
        })
    }

    const removeItem = () => {
        States.rise.actions.setPlayerEquipDecoration(equipType, slotIndex, null)
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}`}>
            <div className="col-3 mhc-name">
                <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
            </div>
            <div className="col-9 mhc-value">
                {Helper.isNotEmpty(decorationItem) ? (
                    <Fragment>
                        <span>[{decorationItem.size}] {_(decorationItem.name)}</span>

                        <div className="mhc-icons_bundle">
                            <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                            <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                        </div>
                    </Fragment>
                ) : (
                    <div className="mhc-icons_bundle">
                        <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                    </div>
                )}
            </div>
        </Fragment>
    )
}

const renderWeaponProperties = (equipExtendItem) => {
    return (
        <div className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhc-content">
                {Helper.isNotEmpty(equipExtendItem.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhc-value mhc-sharpness">
                            <SharpnessBar data={{
                                value: equipExtendItem.sharpness.minValue,
                                steps: equipExtendItem.sharpness.steps
                            }} />
                            <SharpnessBar data={{
                                value: equipExtendItem.sharpness.maxValue,
                                steps: equipExtendItem.sharpness.steps
                            }} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.attack}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.criticalRate}%</span>
                </div>

                {(Helper.isNotEmpty(equipExtendItem.element)
                    && Helper.isNotEmpty(equipExtendItem.element.attack))
                    ? (
                        <Fragment>
                            <div className="col-3 mhc-name">
                                <span>{_('element')}: {_(equipExtendItem.element.attack.type)}</span>
                            </div>
                            <div className="col-3 mhc-value">
                                {equipExtendItem.element.attack.isHidden ? (
                                    <span>({equipExtendItem.element.attack.value})</span>
                                ) : (
                                    <span>{equipExtendItem.element.attack.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipExtendItem.element)
                    && Helper.isNotEmpty(equipExtendItem.element.status))
                    ? (
                        <Fragment>
                            <div className="col-3 mhc-name">
                                <span>{_('element')}: {_(equipExtendItem.element.status.type)}</span>
                            </div>
                            <div className="col-3 mhc-value">
                                {equipExtendItem.element.status.isHidden ? (
                                    <span>({equipExtendItem.element.status.value})</span>
                                ) : (
                                    <span>{equipExtendItem.element.status.value}</span>
                                )}
                            </div>
                        </Fragment>
                    ) : false}

                {(Helper.isNotEmpty(equipExtendItem.elderseal)) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('elderseal')}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            <span>{_(equipExtendItem.elderseal.affinity)}</span>
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.defense}</span>
                </div>
            </div>
        </div>
    )
}

const renderArmorProperties = (equipExtendItem) => {
    return (
        <div className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhc-content">
                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.defense}</span>
                </div>

                {Constant.rise.resistanceTypes.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhc-value">
                                <span>{equipExtendItem.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const renderPetalaceProperties = (equipExtendItem) => {
    return (
        <div className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhc-content">
                <div className="col-3 mhc-name">
                    <span>{_('healthIncrement')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.health.increment}</span>
                </div>
                <div className="col-3 mhc-name">
                    <span>{_('healthObtain')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.health.obtain}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('attackIncrement')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.attack.increment}</span>
                </div>
                <div className="col-3 mhc-name">
                    <span>{_('attackObtain')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.attack.obtain}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('defenseIncrement')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.defense.increment}</span>
                </div>
                <div className="col-3 mhc-name">
                    <span>{_('defenseObtain')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipExtendItem.defense.obtain}</span>
                </div>
            </div>
        </div>
    )
}

const renderEquipPartBlock = (equipType, currentEquipData, requiredEquipData) => {
    let equipExtendItem = Misc.getEquipExtendItem(equipType, currentEquipData)

    // Can Add to Required Contditions
    let isNotRequire = false

    if (Helper.isNotEmpty(currentEquipData.id)) {
        isNotRequire = Helper.jsonHash({
            id: currentEquipData.id,
            custom: currentEquipData.custom
        }) !== Helper.jsonHash({
            id: requiredEquipData.id,
            custom: requiredEquipData.custom
        })
    }

    const showModal = () => {
        States.common.actions.showModal(Misc.equipTypeToDatasetType(equipType) + 'Selector', {
            target: 'playerEquips',
            equipType: equipType
        })
    }

    const removeItem = () => {
        States.rise.actions.setPlayerEquip(equipType, null)
    }

    if (Helper.isEmpty(equipExtendItem)) {
        return (
            <div key={equipType} className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_(equipType)}</span>
                    <div className="mhc-icons_bundle">
                        {'weapon' === equipType || 'charm' === equipType ? (
                            <IconButton
                                iconName="wrench" altName={_('customEquip')}
                                onClick={() => {
                                    States.rise.actions.setPlayerEquip(equipType, 'custom' + Helper.ucfirst(equipType))
                                }} />
                        ) : false}
                        {'charm' !== equipType ? (
                            <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                        ) : false}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div key={equipType + ':' + equipExtendItem.id} className="mhc-item mhc-item-3-step">
            <div className="col-12 mhc-name">
                <span>{_(equipType)}: {_(equipExtendItem.name)}</span>
                <div className="mhc-icons_bundle">
                    {'petalace' !== equipType && isNotRequire ? (
                        <IconButton
                            iconName="arrow-left" altName={_('include')}
                            onClick={() => {
                                States.rise.actions.replaceRequiredConditionsEquipData(equipType, currentEquipData)
                            }} />
                    ) : false}
                    {'weapon' === equipType || 'charm' === equipType ? (
                        <IconButton
                            iconName="wrench" altName={_('customEquip')}
                            onClick={() => {
                                States.rise.actions.setPlayerEquip(equipType, 'custom' + Helper.ucfirst(equipType))
                            }} />
                    ) : false}
                    {'charm' !== equipType ? (
                        <IconButton iconName="exchange" altName={_('change')} onClick={showModal} />
                    ) : false}
                    <IconButton iconName="times" altName={_('clean')} onClick={removeItem} />
                </div>
            </div>

            {('weapon' === Misc.equipTypeToDatasetType(equipType)) ? (
                <div className="col-12 mhc-content">
                    {[...Array(equipExtendItem.rampageSkill.amount)].map((rampageSkillData, rampageSkillIndex) => {
                        return renderRampageSkillOption(
                            rampageSkillIndex,
                            Helper.isNotEmpty(currentEquipData.rampageSkillIds[rampageSkillIndex])
                                ? currentEquipData.rampageSkillIds[rampageSkillIndex] : null
                        )
                    })}
                </div>
            ) : false}

            {(Helper.isNotEmpty(equipExtendItem.slots) && 0 !== equipExtendItem.slots.length) ? (
                <div className="col-12 mhc-content">
                    {equipExtendItem.slots.map((slotData, slotIndex) => {
                        return renderDecorationOption(
                            equipType,
                            slotIndex,
                            slotData.size,
                            Helper.isNotEmpty(currentEquipData.decorationIds[slotIndex])
                                ? currentEquipData.decorationIds[slotIndex] : null
                        )
                    })}
                </div>
            ) : false}

            {('weapon' === Misc.equipTypeToDatasetType(equipType))
                ? renderWeaponProperties(equipExtendItem) : false}

            {('armor' === Misc.equipTypeToDatasetType(equipType))
                ? renderArmorProperties(equipExtendItem) : false}

            {('petalace' === Misc.equipTypeToDatasetType(equipType))
                ? renderPetalaceProperties(equipExtendItem) : false}

            {(Helper.isNotEmpty(equipExtendItem.skills) && 0 !== equipExtendItem.skills.length) ? (
                <div className="col-12 mhc-content">
                    <div className="col-12 mhc-name">
                        <span>{_('skill')}</span>
                    </div>
                    <div className="col-12 mhc-content">
                        {equipExtendItem.skills.sort((skillDataA, skillDataB) => {
                            return skillDataB.level - skillDataA.level
                        }).map((skillData) => {
                            let skillItem = SkillDataset.getItem(skillData.id)

                            return (Helper.isNotEmpty(skillItem)) ? (
                                <div key={skillItem.id} className="col-6 mhc-value">
                                    <span>{_(skillItem.name)} Lv.{skillData.level}</span>
                                </div>
                            ) : false
                        })}
                    </div>
                </div>
            ) : false}
        </div>
    )
}

export default function PlayerEquipsBlock (props) {

    /**
     * Hooks
     */
    const _dataStore = States.rise.hooks.useDataStore()
    const _playerEquips = States.rise.hooks.usePlayerEquips()
    const _requiredConditions = States.rise.hooks.useRequiredConditions()

    const getContent = useMemo(() => {
        let blocks = []

        Object.keys(_playerEquips).forEach((equipType) => {
            if ('weapon' === Misc.equipTypeToDatasetType(equipType)
                && 'customWeapon' === _playerEquips[equipType].id
            ) {
                blocks.push((
                    <CustomWeapon key="customWeapon" target="playerEquips" />
                ))

                return
            }

            if ('charm' === Misc.equipTypeToDatasetType(equipType)
                && 'customCharm' === _playerEquips[equipType].id
            ) {
                blocks.push((
                    <CustomCharm key="customCharm" target="playerEquips" />
                ))

                return
            }

            blocks.push(renderEquipPartBlock(
                equipType,
                _playerEquips[equipType],
                _requiredConditions.equips[equipType]
            ))
        })

        return blocks
    }, [_playerEquips, _requiredConditions])

    return (
        <div className="mhc-block mhc-equips">
            <div className="mhc-panel">
                <span className="mhc-title">{_('equipBundle')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 1'}
                        isActive={0 === _dataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(0) }} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 2'}
                        isActive={1 === _dataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(1) }} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 3'}
                        isActive={2 === _dataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(2) }} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 4'}
                        isActive={3 === _dataStore.playerEquips.index}
                        onClick={() => { handleSwitchDataStore(3) }} />
                </div>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleEquipsDisplayerRefresh} />
                </div>
            </div>

            <div className="mhc-list">
                {getContent}
            </div>
        </div>
    )
}
