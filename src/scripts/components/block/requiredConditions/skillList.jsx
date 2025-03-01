/**
 * Condition Options: Skill List
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Libraries
// import SetDataset from '@/scripts/libraries/dataset/set'
import SkillDataset from '@/scripts/libraries/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load States
import States from '@/scripts/states'

/**
 * Render Functions
 */
const renderSkillItem = (skillData) => {
    let skillItem = SkillDataset.getItem(skillData.id)

    if (Helper.isEmpty(skillItem)) {
        return false
    }

    return (
        <div key={skillItem.id} className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_(skillItem.name)} Lv.{skillData.level} / {skillItem.list.length}</span>

                <div className="mhc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {
                            States.actions.decreaseRequiredConditionsSkillLevel(skillItem.id)
                        }} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {
                            States.actions.increaseRequiredConditionsSkillLevel(skillItem.id)
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.actions.removeRequiredConditionsSkill(skillItem.id)
                        }} />
                </div>
            </div>
            <div className="col-12 mhc-value mhc-description">
                <span>
                    {(0 !== skillData.level)
                        ? _(skillItem.list[skillData.level - 1].effect)
                        : _('skillLevelZero')}
                </span>
            </div>
        </div>
    )
}

export default function SkillList (props) {

    /**
     * Hooks
     */
    const _requiredConditions = States.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: ConditionOptions -> SkillList')

        const showModal = () => {
            States.actions.showModal('skillSelector', {
                target: 'requiredConditions'
            })
        }

        return (
            <div className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('skill')}</span>
                    <div className="mhc-icons_bundle">
                        <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                    </div>
                </div>

                {_requiredConditions.skills.map((skillData) => {
                    return renderSkillItem(skillData)
                })}
             </div>
        )
    }, [
        _requiredConditions
    ])
}
