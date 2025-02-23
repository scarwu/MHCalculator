/**
 * Condition Options: Set List
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
import SetDataset from '@/scripts/libraries/world/dataset/set'
import SkillDataset from '@/scripts/libraries/world/dataset/skill'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load State Control
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleShowSetItemSelector = () => {
    States.common.actions.showModal('conditionItemSelector', {
        mode: 'set'
    })
}

/**
 * Render Functions
 */
const renderSetItem = (set) => {
    let setInfo = SetDataset.getInfo(set.id)

    if (Helper.isEmpty(setInfo)) {
        return false
    }

    let setRequire = setInfo.skills[set.step - 1].require

    return (
        <div key={setInfo.id} className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_(setInfo.name)} x {setRequire}</span>

                <div className="mhc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {States.world.actions.decreaseRequiredSetStep(set.id)}} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {States.world.actions.increaseRequiredSetStep(set.id)}} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {States.world.actions.removeRequiredSet(set.id)}} />
                </div>
            </div>
            <div className="col-12 mhc-value">
                {setInfo.skills.map((skill) => {
                    if (setRequire < skill.require) {
                        return false
                    }

                    let skillInfo = SkillDataset.getInfo(skill.id)

                    return (Helper.isNotEmpty(skillInfo)) ? (
                        <div key={skill.id}>
                            <span>({skill.require}) {_(skillInfo.name)}</span>
                        </div>
                    ) : false
                })}
            </div>
        </div>
    )
}

export default function SetList (props) {

    /**
     * Hooks
     */
    const _requiredConditions = States.world.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: ConditionOptions -> SetList')

        return (
            <div className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('set')}</span>
                    <div className="mhc-icons_bundle">
                        <IconButton
                            iconName="plus" altName={_('add')}
                            onClick={handleShowSetItemSelector} />
                    </div>
                </div>

                {_requiredConditions.sets.map(renderSetItem)}
            </div>
        )
    }, [_requiredConditions])
}
