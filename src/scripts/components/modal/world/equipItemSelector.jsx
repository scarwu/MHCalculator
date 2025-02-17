/**
 * Equip Item Selector
 *
 * @package     Monster Hunter World - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Constant
import Constant from '@/scripts/constant'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Custom Libraries
import WeaponDataset from '@/scripts/libraries/world/dataset/weapon'
import ArmorDataset from '@/scripts/libraries/world/dataset/armor'
import CharmDataset from '@/scripts/libraries/world/dataset/charm'
import DecorationDataset from '@/scripts/libraries/world/dataset/decoration'
import EnhanceDataset from '@/scripts/libraries/world/dataset/enhance'
import SetDataset from '@/scripts/libraries/world/dataset/set'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconSelector from '@/scripts/components/ui/iconSelector'
import IconInput from '@/scripts/components/ui/iconInput'
import SharpnessBar from '@/scripts/components/ui/sharpnessBar'

// Load State Control
import States from '@/scripts/states'

const targetModalKey = 'equipItemSelector'

/**
 * Handle Functions
 */
const handleItemPickUp = (data, itemId) => {
    if (Helper.isNotEmpty(data.enhanceIndex)) {
        data.enhanceId = itemId
    } else if (Helper.isNotEmpty(data.slotIndex)) {
        data.decorationId = itemId
    } else {
        data.equipId = itemId
    }

    States.world.actions.setPlayerEquip(data)
    States.common.actions.hideModal(targetModalKey)
}

/**
 * Render Functions
 */
const renderWeaponItem = (weapon, data) => {
    let originalSharpness = null
    let enhancedSharpness = null

    if (Helper.isNotEmpty(weapon.sharpness)) {
        originalSharpness = Helper.deepCopy(weapon.sharpness)
        enhancedSharpness = Helper.deepCopy(weapon.sharpness)
        enhancedSharpness.value += 50
    }

    if (Helper.isNotEmpty(weapon.element.attack)
        && Helper.isEmpty(weapon.element.attack.maxValue)
    ) {
        weapon.element.attack.maxValue = '?'
    }

    if (Helper.isNotEmpty(weapon.element.status)
        && Helper.isEmpty(weapon.element.status.maxValue)
    ) {
        weapon.element.status.maxValue = '?'
    }

    return (
        <div key={weapon.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>{_(weapon.name)}</span>

                <div className="mhc-icons_bundle">
                    {(false === weapon.isSelect) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleItemPickUp(data, weapon.id)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                <div className="col-3 mhc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhc-value">
                    <span>{_(weapon.series)}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('attack')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{weapon.attack}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('criticalRate')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{weapon.criticalRate}</span>
                </div>

                {Helper.isNotEmpty(weapon.sharpness) ? (
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

                {Helper.isNotEmpty(weapon.element.attack) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_(weapon.element.attack.type)}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            {weapon.element.attack.isHidden ? (
                                <span>({weapon.element.attack.minValue}-{weapon.element.attack.maxValue})</span>
                            ) : (
                                <span>{weapon.element.attack.minValue}-{weapon.element.attack.maxValue}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                {Helper.isNotEmpty(weapon.element.status) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_(weapon.element.status.type)}</span>
                        </div>
                        <div className="col-3 mhc-value">
                            {weapon.element.status.isHidden ? (
                                <span>({weapon.element.status.minValue}-{weapon.element.status.maxValue})</span>
                            ) : (
                                <span>{weapon.element.status.minValue}-{weapon.element.status.maxValue}</span>
                            )}
                        </div>
                    </Fragment>
                ) : false}

                <div className="col-3 mhc-name">
                    <span>{_('elderseal')}</span>
                </div>
                <div className="col-3 mhc-value">
                    {Helper.isNotEmpty(weapon.elderseal) ? (
                        <span>{_(weapon.elderseal.affinity)}</span>
                    ) : false}
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{weapon.defense}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-3 mhc-value">
                    {weapon.slots.map((slot, index) => {
                        return (
                            <span key={index}>[{slot.size}]</span>
                        )
                    })}
                </div>

                {weapon.skills.map((skill, index) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhc-name">
                                <span>{_(skillInfo.name)} Lv.{skill.level}</span>
                            </div>
                            <div className="col-12 mhc-value mhc-description">
                                <span>{_(skillInfo.list[skill.level - 1].description)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

const renderArmorItem = (armor, data) => {
    let setInfo = Helper.isNotEmpty(armor.set)
        ? SetDataset.getInfo(armor.set.id) : false

    // Re-write BypassData
    data.equipType = armor.type

    return (
        <div key={armor.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>{_(armor.name)}</span>

                <div className="mhc-icons_bundle">
                    {(false === armor.isSelect) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleItemPickUp(data, armor.id)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                <div className="col-3 mhc-name">
                    <span>{_('series')}</span>
                </div>
                <div className="col-9 mhc-value">
                    <span>{_(armor.series)}</span>
                </div>

                <div className="col-3 mhc-name">
                    <span>{_('defense')}</span>
                </div>
                <div className="col-3 mhc-value">
                    <span>{armor.defense}</span>
                </div>

                {Constant.world.resistances.map((resistanceType) => {
                    return (
                        <Fragment key={resistanceType}>
                            <div className="col-3 mhc-name">
                                <span>{_('resistance')}: {_(resistanceType)}</span>
                            </div>
                            <div className="col-3 mhc-value">
                                <span>{armor.resistance[resistanceType]}</span>
                            </div>
                        </Fragment>
                    )
                })}

                <div className="col-3 mhc-name">
                    <span>{_('slot')}</span>
                </div>
                <div className="col-9 mhc-value">
                    {armor.slots.map((slot, index) => {
                        return (
                            <span key={index}>[{slot.size}]</span>
                        )
                    })}
                </div>

                {Helper.isEmpty(setInfo) ? (
                    <Fragment>
                        <div className="col-3 mhc-name">
                            <span>{_('set')}</span>
                        </div>
                        <div className="col-9 mhc-value">
                            <span>{_(setInfo.name)}</span>
                        </div>
                    </Fragment>
                ) : false}

                {armor.skills.map((skill, index) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhc-name">
                                <span>{_(skillInfo.name)} Lv.{skill.level}</span>
                            </div>
                            <div className="col-12 mhc-value mhc-description">
                                <span>{_(skillInfo.list[skill.level - 1].description)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

const renderCharmItem = (charm, data) => {
    return (
        <div key={charm.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>{_(charm.name)}</span>

                <div className="mhc-icons_bundle">
                    {(false === charm.isSelect) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleItemPickUp(data, charm.id)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                {charm.skills.map((skill, index) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhc-name">
                                <span>{_(skillInfo.name)} Lv.{skill.level}</span>
                            </div>
                            <div className="col-12 mhc-value mhc-description">
                                <span>{_(skillInfo.list[skill.level - 1].description)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

const renderDecorationItem = (decoration, data) => {
    return (
        <div key={decoration.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>[{decoration.size}] {_(decoration.name)}</span>

                <div className="mhc-icons_bundle">
                    {(false === decoration.isSelect) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleItemPickUp(data, decoration.id)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                {decoration.skills.map((skill, index) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return Helper.isNotEmpty(skillInfo) ? (
                        <Fragment key={index}>
                            <div className="col-12 mhc-name">
                                <span>{_(skillInfo.name)} Lv.{skill.level}</span>
                            </div>
                            <div className="col-12 mhc-value mhc-description">
                                <span>{_(skillInfo.list[skill.level - 1].description)}</span>
                            </div>
                        </Fragment>
                    ) : false
                })}
            </div>
        </div>
    )
}

const renderEnhanceItem = (enhance, data) => {
    return (
        <div key={enhance.id} className="mhc-item mhc-item-2-step">
            <div className="col-12 mhc-name">
                <span>{_(enhance.name)}</span>

                <div className="mhc-icons_bundle">
                    {(false === enhance.isSelect) ? (
                        <IconButton
                            iconName="check" altName={_('select')}
                            onClick={() => {handleItemPickUp(data, enhance.id)}} />
                    ) : false}
                </div>
            </div>
            <div className="col-12 mhc-content">
                {enhance.list.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            <div className="col-2 mhc-name">
                                <span>Lv.{item.level}</span>
                            </div>
                            <div className="col-10 mhc-value mhc-description">
                                <span>{_(item.description)}</span>
                            </div>
                        </Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default function EquipItemSelector (props) {

    /**
     * Hooks
     */
    const _modalData = States.common.hooks.useModalData(targetModalKey)

    const [stateMode, updateMode] = useState(null)
    const [stateSortedList, updateSortedList] = useState([])
    const [stateType, updateType] = useState(null)
    const [stateRare, updateRare] = useState(null)
    const [stateTypeList, updateTypeList] = useState([])
    const [stateRareList, updateRareList] = useState([])
    const [stateSegment, updateSegment] = useState(null)

    const refModal = useRef(null)

    useEffect(() => {
        if (Helper.isEmpty(_modalData)) {
            return
        }

        let mode = null
        let sortedList = []
        let typeList = {}
        let rareList = {}
        let type = null
        let rare = null

        if (Helper.isNotEmpty(_modalData.enhanceIndex)) {
            mode = 'enhance'
            sortedList = EnhanceDataset.getItems().map((enhanceInfo) => {
                enhanceInfo.isSelect = (_modalData.enhanceId === enhanceInfo.id)

                return enhanceInfo
            })
        } else if (Helper.isNotEmpty(_modalData.slotIndex)) {
            mode = 'decoration'

            for (let size = _modalData.slotSize; size >= 1; size--) {
                for (let rare = 9; rare >= 5; rare--) {
                    sortedList = sortedList.concat(
                        DecorationDataset.rareIs(rare).sizeIs(size).getItems().map((decorationInfo) => {
                            decorationInfo.isSelect = (_modalData.decorationId === decorationInfo.id)

                            return decorationInfo
                        })
                    )
                }
            }
        } else if ('weapon' === _modalData.equipType) {
            let weaponInfo = WeaponDataset.getInfo(_modalData.equipId)

            typeList = Constant.world.weaponTypes.map((type) => {
                return { key: type, value: _(type) }
            })
            type = (Helper.isNotEmpty(weaponInfo) && Helper.isNotEmpty(weaponInfo.type))
                ? weaponInfo.type : typeList[0].key

            mode = 'weapon'
            sortedList =  WeaponDataset.getItems().map((weaponInfo) => {
                rareList[weaponInfo.rare] = weaponInfo.rare

                weaponInfo.isSelect = (_modalData.equipId === weaponInfo.id)

                return weaponInfo
            })

            rareList = Object.values(rareList).reverse().map((rare) => {
                return { key: rare, value: _('rare') + `: ${rare}` }
            })
            rare = (Helper.isNotEmpty(weaponInfo)) ? weaponInfo.rare : rareList[0].key
        } else if ('helm' === _modalData.equipType
            || 'chest' === _modalData.equipType
            || 'arm' === _modalData.equipType
            || 'waist' === _modalData.equipType
            || 'leg' === _modalData.equipType
        ) {
            let armoreInfo = ArmorDataset.getInfo(_modalData.equipId)

            typeList = Constant.world.armorTypes.map((type) => {
                return { key: type, value: _(type) }
            })
            type = (Helper.isNotEmpty(_modalData.equipType))
                ? _modalData.equipType : typeList[0].key

            mode = 'armor'
            sortedList = ArmorDataset.getItems().map((armorInfo) => {
                rareList[armorInfo.rare] = armorInfo.rare

                armorInfo.isSelect = (_modalData.equipId === armorInfo.id)

                return armorInfo
            })

            rareList = Object.values(rareList).reverse().map((rare) => {
                return { key: rare, value: _('rare') + `: ${rare}` }
            })
            rare = (Helper.isNotEmpty(armoreInfo)) ? armoreInfo.rare : rareList[0].key
        } else if ('charm' === _modalData.equipType) {
            mode = 'charm'
            sortedList = CharmDataset.getItems().map((charmInfo) => {
                charmInfo.isSelect = (_modalData.equipId === charmInfo.id)

                return charmInfo
            })
        }

        updateMode(mode)
        updateSortedList(sortedList)
        updateTypeList(typeList)
        updateRareList(rareList)
        updateType(type)
        updateRare(rare)
    }, [_modalData])

    /**
     * Handle Functions
     */
    const handleFastWindowClose = useCallback((event) => {
        if (refModal.current !== event.target) {
            return
        }

        States.common.actions.hideModal(targetModalKey)
    }, [])

    const handleSegmentInput = useCallback((event) => {
        let segment = event.target.value

        segment = (0 !== segment.length)
            ? segment.replace(/([.?*+^$[\]\\(){}|-])/g, '').trim() : null

        updateSegment(segment)
    }, [])

    const handleTypeChange = useCallback((event) => {
        updateType(event.target.value)
    }, [])

    const handleRareChange = useCallback((event) => {
        updateRare(parseInt(event.target.value, 10))
    }, [])

    const getContent = useMemo(() => {
        if (Helper.isEmpty(_modalData)) {
            return false
        }

        let data = Helper.deepCopy(_modalData)

        switch (stateMode) {
        case 'weapon':
            return stateSortedList.filter((data) => {
                if (data.type !== stateType) {
                    return false
                }

                if (data.rare !== stateRare) {
                    return false
                }

                // Create Text
                let text = _(data.name)
                text += _(data.series)
                text += _(data.type)

                if (Helper.isNotEmpty(data.element)
                    && Helper.isNotEmpty(data.element.attack)
                ) {
                    text += _(data.element.attack.type)
                }

                if (Helper.isNotEmpty(data.element)
                    && Helper.isNotEmpty(data.element.status)
                ) {
                    text += _(data.element.status.type)
                }

                data.skills.forEach((data) => {
                    let skillInfo = SkillDataset.getInfo(data.id)

                    if (Helper.isNotEmpty(skillInfo)) {
                        text += _(skillInfo.name)
                    }
                })

                // Search Nameword
                if (Helper.isNotEmpty(stateSegment)
                    && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                ) {
                    return false
                }

                return true
            }).sort((dataA, dataB) => {
                return _(dataA.id) > _(dataB.id) ? 1 : -1
            }).map((data) => {
                return renderWeaponItem(data, data)
            })
        case 'armor':
            return stateSortedList.filter((data) => {
                if (data.type !== stateType) {
                    return false
                }

                if (data.rare !== stateRare) {
                    return false
                }

                // Create Text
                let text = _(data.name)
                text += _(data.series)

                if (Helper.isNotEmpty(data.set)) {
                    let setInfo = SetDataset.getInfo(data.set.id)

                    if (Helper.isNotEmpty(setInfo)) {
                        text += _(setInfo.name)
                    }
                }

                data.skills.forEach((data) => {
                    let skillInfo = SkillDataset.getInfo(data.id)

                    if (Helper.isNotEmpty(skillInfo)) {
                        text += _(skillInfo.name)
                    }
                })

                // Search Nameword
                if (Helper.isNotEmpty(stateSegment)
                    && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                ) {
                    return false
                }

                return true
            }).sort((dataA, dataB) => {
                return _(dataA.id) > _(dataB.id) ? 1 : -1
            }).map((data) => {
                return renderArmorItem(data, data)
            })
        case 'charm':
            return stateSortedList.filter((data) => {

                // Create Text
                let text = _(data.name)

                data.skills.forEach((data) => {
                    let skillInfo = SkillDataset.getInfo(data.id)

                    if (Helper.isNotEmpty(skillInfo)) {
                        text += _(skillInfo.anem)
                    }
                })

                // Search Nameword
                if (Helper.isNotEmpty(stateSegment)
                    && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                ) {
                    return false
                }

                return true
            }).sort((dataA, dataB) => {
                return _(dataA.id) > _(dataB.id) ? 1 : -1
            }).map((data) => {
                return renderCharmItem(data, data)
            })
        case 'decoration':
            return stateSortedList.filter((data) => {

                // Create Text
                let text = _(data.name)

                data.skills.forEach((skill) => {
                    let skillInfo = SkillDataset.getInfo(skill.id)

                    if (Helper.isNotEmpty(skillInfo)) {
                        text += _(skillInfo.name)
                    }
                })

                // Search Nameword
                if (Helper.isNotEmpty(stateSegment)
                    && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                ) {
                    return false
                }

                return true
            }).sort((dataA, dataB) => {
                return _(dataA.id) > _(dataB.id) ? 1 : -1
            }).map((data) => {
                return renderDecorationItem(data, data)
            })
        case 'enhance':
            return stateSortedList.filter((data) => {

                // Create Text
                let text = _(data.name)

                data.list.forEach((data) => {
                    text += _(data.description)
                })

                // Search Nameword
                if (Helper.isNotEmpty(stateSegment)
                    && -1 === text.toLowerCase().search(stateSegment.toLowerCase())
                ) {
                    return false
                }

                return true
            }).filter((data) => {
                return -1 !== data.allowRares.indexOf(data.equipRare)
                    && -1 === data.enhanceIds.indexOf(data.id)
            }).sort((dataA, dataB) => {
                return _(dataA.id) > _(dataB.id) ? 1 : -1
            }).map((data) => {
                return renderEnhanceItem(data, data)
            })
        default:
            return false
        }
    }, [
        _modalData,
        stateMode,
        stateSortedList,
        stateTypeList,
        stateRareList,
        stateType,
        stateRare,
        stateSegment
    ])

    return Helper.isNotEmpty(_modalData) ? (
        <div className="mhc-selector" ref={refModal} onClick={handleFastWindowClose}>
            <div className="mhc-modal">
                <div className="mhc-panel">
                    <div className="mhc-icons_bundle-left">
                        <IconInput
                            iconName="search" placeholder={_('inputKeyword')}
                             defaultValue={stateSegment} onChange={handleSegmentInput} />

                        {('weapon' === stateMode || 'armor' === stateMode) ? (
                            <IconSelector
                                iconName="globe" defaultValue={stateType}
                                options={stateTypeList} onChange={handleTypeChange} />
                        ) : false}

                        {('weapon' === stateMode || 'armor' === stateMode) ? (
                            <IconSelector
                                iconName="globe" defaultValue={stateRare}
                                options={stateRareList} onChange={handleRareChange} />
                        ) : false}
                    </div>

                    <span className="mhc-title">{_(stateMode + 'List')}</span>

                    <div className="mhc-icons_bundle-right">
                        <IconButton
                            iconName="times" altName={_('close')}
                            onClick={() => { States.common.actions.hideModal(targetModalKey) }} />
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