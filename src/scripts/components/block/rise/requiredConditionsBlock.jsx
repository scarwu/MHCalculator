/**
 * Condition Options
 *
 * @package     Monster Hunter - Calculator
 * @author      Scar Wu
 * @copyright   Copyright (c) Scar Wu (https://scar.tw)
 * @link        https://github.com/scarwu/MHCalculator
 */

import React, { useState, useEffect, useCallback } from 'react'

// Load Core Libraries
import _ from '@/scripts/core/lang'
import Helper from '@/scripts/core/helper'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'
import IconTab from '@/scripts/components/ui/iconTab'

import EquipList from '@/scripts/components/block/rise/requiredConditionsBlock/equipList'
import SetList from '@/scripts/components/block/rise/requiredConditionsBlock/setList'
import SkillList from '@/scripts/components/block/rise/requiredConditionsBlock/skillList'

// Load States
import States from '@/scripts/states'

/**
 * Handle Functions
 */
const handleRequireConditionRefresh = () => {
    States.rise.actions.cleanRequiredConditions()
}

const handleSwitchDataStore = (index) => {
    States.rise.actions.switchDataStore('requiredConditions', index)
}

export default function RequiredConditionsBlock (props) {

    /**
     * Hooks
     */
    const [stateDataStore, updateDataStore] = useState(States.rise.getters.getDataStore())

    // Like Did Mount & Will Unmount Cycle
    useEffect(() => {
        const unsubscribe = States.store.subscribe(() => {
            updateDataStore(States.rise.getters.getDataStore())
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <div className="mhc-block mhc-conditions">
            <div className="mhc-panel">
                <span className="mhc-title">{_('requireCondition')}</span>

                <div className="mhc-icons_bundle-left">
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 1'}
                        isActive={0 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(0)}} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 2'}
                        isActive={1 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(1)}} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 3'}
                        isActive={2 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(2)}} />
                    <IconTab
                        iconName="circle" altName={_('tab') + ' 4'}
                        isActive={3 === stateDataStore.requiredConditions.index}
                        onClick={() => {handleSwitchDataStore(3)}} />
                </div>

                <div className="mhc-icons_bundle-right">
                    <IconButton
                        iconName="refresh" altName={_('reset')}
                        onClick={handleRequireConditionRefresh} />
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
