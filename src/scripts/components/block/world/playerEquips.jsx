/**
 * Equips Displayer
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useMemo } from 'react'

// Load Config & Constant
import Config from '@/scripts/config'
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
import Misc from '@/scripts/libraries/world/misc'
import JewelDataset from '@/scripts/libraries/world/dataset/jewel'
import EnhanceDataset from '@/scripts/libraries/world/dataset/enhance'
import SetDataset from '@/scripts/libraries/world/dataset/set'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import CustomWeapon from '@/scripts/components/block/world/playerEquips/customWeapon'
import IconButton from '@/scripts/components/ui/iconButton'
import IconTab from '@/scripts/components/ui/iconTab'
import SharpnessBar from '@/scripts/components/ui/sharpnessBar'

// Load State Control
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleEquipsDisplayerRefresh = () => {
    States.world.actions.cleanCurrentEquips()
}

const handleSwitchTempData = (index) => {
    States.world.actions.switchTempData('playerEquips', index)
}

/**
 * Render Functions
 */
const renderEnhanceBlock = (equipInfo) => {
    let usedSize = 0

    equipInfo.enhances.forEach((enhance) => {
        let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

        usedSize += enhanceInfo.list[enhance.level - 1].size
    })

    return (
        <div className="col-12 mhc-content">
            <div className="col-3 mhc-name">
                <span>{_('enhanceFieldSize')}</span>
            </div>
            <div className="col-9 mhc-value">
                <span>{usedSize} / {equipInfo.enhanceSize}</span>
                <div className="mhc-icons_bundle">
                    {(usedSize < equipInfo.enhanceSize) ? (
                        <IconButton key={equipInfo.enhances.length} iconName="plus" altName={_('add')} onClick={() => {
                            States.world.actions.showEquipItemSelector({
                                equipType: equipInfo.type,
                                equipRare: equipInfo.rare,
                                enhanceIndex: equipInfo.enhances.length,
                                enhanceIds: equipInfo.enhances.map((enhance) => {
                                    return enhance.id
                                })
                            })
                        }} />
                    ) : false}
                </div>
            </div>

            {equipInfo.enhances.map((enhance, index) => {
                let enhanceInfo = EnhanceDataset.getInfo(enhance.id)

                let currentLevel = enhance.level
                let prevLevel = 1 <= (currentLevel - 1)
                    ? currentLevel - 1 : currentLevel
                let nextLevel = (currentLevel + 1) <= enhanceInfo.list.length
                    ? currentLevel + 1 : currentLevel
                let currentSize = enhanceInfo.list[currentLevel - 1].size
                let prevSize = enhanceInfo.list[prevLevel - 1].size
                let nextSize = enhanceInfo.list[nextLevel - 1].size

                if ((usedSize + nextSize - currentSize) > equipInfo.enhanceSize) {
                    nextLevel = currentLevel
                } else if (-1 === enhanceInfo.list[nextLevel - 1].allowRares.indexOf(equipInfo.rare)) {
                    nextLevel = currentLevel
                }

                return (
                    <Fragment key={`${equipInfo.type}:${index}`}>
                        <div className="col-3 mhc-name">
                            <span>{_('enhance')}: {index + 1}</span>
                        </div>
                        <div className="col-9 mhc-value">
                            <span>[{enhanceInfo.list[currentLevel - 1].size}] {_(enhanceInfo.name)} Lv.{currentLevel}</span>
                            <div className="mhc-icons_bundle">
                                <IconButton key={`prev:${prevLevel}`} iconName="minus-circle" altName={_('down')} onClick={() => {
                                    States.world.actions.setCurrentEquip({
                                        equipType: equipInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: enhance.id,
                                        enhanceLevel: prevLevel
                                    })
                                }} />
                                <IconButton key={`next:${nextLevel}`} iconName="plus-circle" altName={_('up')} onClick={() => {
                                    States.world.actions.setCurrentEquip({
                                        equipType: equipInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: enhance.id,
                                        enhanceLevel: nextLevel
                                    })
                                }} />
                                <IconButton iconName="times" altName={_('clean')} onClick={() => {
                                    States.world.actions.setCurrentEquip({
                                        equipType: equipInfo.type,
                                        enhanceIndex: index,
                                        enhanceId: null
                                    })
                                }} />
                            </div>
                        </div>
                    </Fragment>
                )
            })}
        </div>
    )
}

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
            <Fragment key={`${equipType}:${slotIndex}`}>
                <div className="col-3 mhc-name">
                    <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
                </div>
                <div className="col-9 mhc-value">
                    <div className="mhc-icons_bundle">
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {States.world.actions.showEquipItemSelector(selectorData)}} />
                    </div>
                </div>
            </Fragment>
        )
    }

    return (
        <Fragment key={`${equipType}:${slotIndex}`}>
            <div className="col-3 mhc-name">
                <span>{_('slot')}: {slotIndex + 1} [{slotSize}]</span>
            </div>
            <div className="col-9 mhc-value">
                <span>[{jewelInfo.size}] {_(jewelInfo.name)}</span>
                <div className="mhc-icons_bundle">
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => {States.world.actions.showEquipItemSelector(selectorData)}} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {States.world.actions.setCurrentEquip(emptySelectorData)}} />
                </div>
            </div>
        </Fragment>
    )
}

const renderWeaponProperties = (equipInfo) => {
    let originalSharpness = null
    let enhancedSharpness = null

    if (Helper.isNotEmpty(equipInfo.sharpness)) {
        originalSharpness = Helper.deepCopy(equipInfo.sharpness)
        enhancedSharpness = Helper.deepCopy(equipInfo.sharpness)
        enhancedSharpness.value += 50
    }

    return (
        <div className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_('property')}</span>
            </div>
            <div className="col-12 mhc-content">
                {Helper.isNotEmpty(equipInfo.sharpness) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('sharpness')}</span>
                        </div>
                        <div className="col-9 mhc-value mhc-sharpness">
                            <SharpnessBar data={originalSharpness} />
                            <SharpnessBar data={enhancedSharpness} />
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipInfo.attack}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipInfo.criticalRate}%</span>
                </div>

                {(Helper.isNotEmpty(equipInfo.element)
                    && Helper.isNotEmpty(equipInfo.element.attack))
                ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('element')}: {_(equipInfo.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            {equipInfo.element.attack.isHidden ? (
                                <span>({equipInfo.element.attack.value})</span>
                            ) : (
                                <span>{equipInfo.element.attack.value}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                {(Helper.isNotEmpty(equipInfo.element)
                    && Helper.isNotEmpty(equipInfo.element.status))
                ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('element')}: {_(equipInfo.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            {equipInfo.element.status.isHidden ? (
                                <span>({equipInfo.element.status.value})</span>
                            ) : (
                                <span>{equipInfo.element.status.value}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                {(Helper.isNotEmpty(equipInfo.elderseal)) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('elderseal')}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            <span>{_(equipInfo.elderseal.affinity)}</span>
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{equipInfo.defense}</span>
                </div>
            </div>
        </div>
    )
}

const renderArmorProperties = (equipInfo) => {
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
                    <span>{equipInfo.defense}</span>
                </div>

                {Constant.world.resistances.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhc-value">
                                <span>{equipInfo.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const renderEquipBlock = (equipType, currentEquip, requiredEquip) => {
    let equipInfo = null

    if ('weapon' === equipType) {
        equipInfo = Misc.getAppliedWeaponInfo(currentEquip)
    } else if ('helm' === equipType
        || 'chest' === equipType
        || 'arm' === equipType
        || 'waist' === equipType
        || 'leg' === equipType
    ) {
        equipInfo = Misc.getAppliedArmorInfo(currentEquip)
    } else if ('charm' === equipType) {
        equipInfo = Misc.getAppliedCharmInfo(currentEquip)
    } else {
        return false
    }

    let selectorData = {
        equipType: equipType,
        equipId: (Helper.isNotEmpty(equipInfo)) ? equipInfo.id : null
    }

    let emptySelectorData = {
        equipType: equipType,
        equipId: null
    }

    let isNotRequire = true

    if (Helper.isNotEmpty(requiredEquip)) {
        if ('weapon' === equipType) {
            isNotRequire = Helper.jsonHash({
                id: currentEquip.id,
                enhances: currentEquip.enhances
            }) !== Helper.jsonHash({
                id: requiredEquip.id,
                enhances: requiredEquip.enhances
            })
        } else {
            isNotRequire = currentEquip.id !== requiredEquip.id
        }
    }

    if (Helper.isEmpty(equipInfo)) {
        return (
            <div key={equipType} className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_(equipType)}</span>
                    <div className="mhc-icons_bundle">
                        {'weapon' === equipType ? (
                            <IconButton
                                iconName="wrench" altName={_('customWeapon')}
                                onClick={() => {States.world.actions.setCurrentEquip({
                                    equipType: 'weapon',
                                    equipId: 'customWeapon'
                                })}} />
                        ) : false}
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={() => {States.world.actions.showEquipItemSelector(selectorData)}} />
                    </div>
                </div>
            </div>
        )
    }

    let setInfo = (Helper.isNotEmpty(equipInfo.set))
        ? SetDataset.getInfo(equipInfo.set.id) : null

    return (
        <div key={selectorData.equipId} className="mhc-item mhc-item-3-step">
            <div className="col-12 mhc-name">
                <span>{_(equipType)}: {_(equipInfo.name)}</span>
                <div className="mhc-icons_bundle">
                    {isNotRequire ? (
                        <IconButton
                            iconName="arrow-left" altName={_('include')}
                            onClick={() => {States.world.actions.setRequiredEquips(equipType, currentEquip)}} />
                    ) : false}
                    {'weapon' === equipType ? (
                        <IconButton
                            iconName="wrench" altName={_('customWeapon')}
                            onClick={() => {States.world.actions.setCurrentEquip({
                                equipType: 'weapon',
                                equipId: 'customWeapon'
                            })}} />
                    ) : false}
                    <IconButton
                        iconName="exchange" altName={_('change')}
                        onClick={() => {States.world.actions.showEquipItemSelector(selectorData)}} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {States.world.actions.setCurrentEquip(emptySelectorData)}} />
                </div>
            </div>

            {(0 < equipInfo.enhanceSize) ? (
                renderEnhanceBlock(equipInfo)
            ) : false}

            {(Helper.isNotEmpty(equipInfo.slots)
                && 0 !== equipInfo.slots.length)
            ? (
                <div className="col-12 mhc-content">
                    {equipInfo.slots.map((data, index) => {
                        return renderJewelOption(
                            equipType, index, data.size,
                            JewelDataset.getInfo(data.jewel.id)
                        )
                    })}
                </div>
            ) : false}

            {('weapon' === equipType)
                ? renderWeaponProperties(equipInfo) : false}

            {('weapon' !== equipType && 'charm' !== equipType)
                ? renderArmorProperties(equipInfo) : false}

            {(Helper.isNotEmpty(setInfo)) ? (
                <div className="col-12 mhc-content">
                    <div className="col-3 mhc-name">
                        <span>{_('set')}</span>
                    </div>
                    <div className="col-9 mhc-value">
                        <span>{_(setInfo.name)}</span>
                    </div>
                </div>
            ) : false}

            {(Helper.isNotEmpty(equipInfo.skills)
                && 0 !== equipInfo.skills.length)
            ? (
                <div className="col-12 mhc-content">
                    <div className="col-12 mhc-name">
                        <span>{_('skill')}</span>
                    </div>
                    <div className="col-12 mhc-content">
                        {equipInfo.skills.sort((skillA, skillB) => {
                            return skillB.level - skillA.level
                        }).map((data) => {
                            let skillInfo = SkillDataset.getInfo(data.id)

                            return (Helper.isNotEmpty(skillInfo)) ? (
                                <div key={data.id} className="col-6 mhc-value">
                                    <span>{_(skillInfo.name)} Lv.{data.level}</span>
                                </div>
                            ) : false
                        })}
                    </div>
                </div>
            ) : false}
        </div>
    )
}

export default function PlayerEquips(props) {

    /**
     * Hooks
     */
    const [stateTempData, updateTempData] = useState(States.world.getters.getTempData())
    const [stateCurrentEquips, updateCurrentEquips] = useState(States.world.getters.getCurrentEquips())
    const [stateRequiredEquips, updateRequiredEquips] = useState(States.world.getters.getRequiredEquips())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateTempData(States.world.getters.getTempData())
            updateCurrentEquips(States.world.getters.getCurrentEquips())
            updateRequiredEquips(States.world.getters.getRequiredEquips())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const getContent = useMemo(() => {
        let blocks = []

        Object.keys(stateCurrentEquips).forEach((equipType) => {
            if (Helper.isNotEmpty(stateCurrentEquips[equipType])
                && 'customWeapon' === stateCurrentEquips[equipType].id
            ) {
                blocks.push((
                    <CustomWeapon key="customWeapon" />
                ))
            } else {
                blocks.push(renderEquipBlock(
                    equipType,
                    stateCurrentEquips[equipType],
                    stateRequiredEquips[equipType]
                ))
            }
        })

        return blocks
    }, [stateCurrentEquips, stateRequiredEquips])

    return (
        <div className="mhc-block mhc-equips">
            <div className="mhc-panel">
                <span className="mhc-title">{_('equipBundle')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 1'}
                        isActive={0 === stateTempData.playerEquips.index}
                        onClick={() => {handleSwitchTempData(0)}} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 2'}
                        isActive={1 === stateTempData.playerEquips.index}
                        onClick={() => {handleSwitchTempData(1)}} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 3'}
                        isActive={2 === stateTempData.playerEquips.index}
                        onClick={() => {handleSwitchTempData(2)}} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 4'}
                        isActive={3 === stateTempData.playerEquips.index}
                        onClick={() => {handleSwitchTempData(3)}} />
                </div>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleEquipsDisplayerRefresh} />
                    <IconButton
                        iconName="th-list" altName={_('bundleList')}
                        onClick={States.world.actions.showBundleItemSelector} />
                </div>
            </div>

            <div className="mhc-list">
                {getContent}
            </div>
        </div>
    )
}
