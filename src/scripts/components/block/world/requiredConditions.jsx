/**
 * Condition Options
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (http://scar.tw)
 * @link        https://github.com/scarwu/Monster Hunter - Calculator
 */

import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Load Core
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconTab from '@/scripts/components/ui/iconTab'

import EquipList from '@/scripts/components/block/world/requiredConditions/equipList'
import SetList from '@/scripts/components/block/world/requiredConditions/setList'
import SkillList from '@/scripts/components/block/world/requiredConditions/skillList'

// Load State Control
import States from '@/scripts/states'

export default function RequiredConditionsBlock (props) {

    /**
     * Hooks
     */
    const _dataStore = States.world.hooks.useDataStore()

    return (
        <div className="mhc-block mhc-conditions">
            <div className="mhc-panel">
                <span className="mhc-title">{_('requireCondition')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 1'}
                        isActive={0 === _dataStore.requiredConditions.index}
                        onClick={() => { States.world.actions.switchDataStore('requiredConditions', 0) }} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 2'}
                        isActive={1 === _dataStore.requiredConditions.index}
                        onClick={() => { States.world.actions.switchDataStore('requiredConditions', 1) }} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 3'}
                        isActive={2 === _dataStore.requiredConditions.index}
                        onClick={() => { States.world.actions.switchDataStore('requiredConditions', 2) }} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 4'}
                        isActive={3 === _dataStore.requiredConditions.index}
                        onClick={() => { States.world.actions.switchDataStore('requiredConditions', 3) }} />
                </div>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={() => { States.world.actions.cleanRequiredConditions() }} />
                </div>
            </div>

            <div className="mhc-list">
                <EquipList />
                <SetList />
                <SkillList />
            </div>
        </div>
    )
}
