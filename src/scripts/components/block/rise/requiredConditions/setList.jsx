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
// import SetDataset from '@/scripts/libraries/rise/dataset/set'
import SetDataset from '@/scripts/libraries/rise/dataset/set'

// Load Components
import IconButton from '@/scripts/components/ui/iconButton'

// Load States
import States from '@/scripts/states'

/**
 * Render Functions
 */
const renderSetItem = (setData) => {
    let setItem = SetDataset.getItem(setData.id)

    if (Helper.isEmpty(setItem)) {
        return false
    }

    return (
        <div key={setItem.id} className="col-12 mhc-content">
            <div className="col-12 mhc-name">
                <span>{_(setItem.name)} x {setData.count} / {setItem.items.length}</span>

                <div className="mhc-icons_bundle">
                    <IconButton
                        iconName="minus-circle" altName={_('down')}
                        onClick={() => {
                            States.rise.actions.decreaseRequiredConditionsSetCount(setItem.id)
                        }} />
                    <IconButton
                        iconName="plus-circle" altName={_('up')}
                        onClick={() => {
                            States.rise.actions.increaseRequiredConditionsSetCount(setItem.id)
                        }} />
                    <IconButton
                        iconName="times" altName={_('clean')}
                        onClick={() => {
                            States.rise.actions.removeRequiredConditionsSet(setItem.id)
                        }} />
                </div>
            </div>
        </div>
    )
}

export default function SetList (props) {

    /**
     * Hooks
     */
    const _requiredConditions = States.rise.hooks.useRequiredConditions()

    return useMemo(() => {
        Helper.debug('Component: ConditionOptions -> SetList')

        const showModal = () => {
            States.common.actions.showModal('setSelector', {
                target: 'requiredConditions'
            })
        }

        return (
            <div className="mhc-item mhc-item-3-step">
                <div className="col-12 mhc-name">
                    <span>{_('set')}</span>
                    <div className="mhc-icons_bundle">
                        {(0 === _requiredConditions.sets.length) ? (
                            <IconButton iconName="plus" altName={_('add')} onClick={showModal} />
                        ) : (
                            <IconButton iconName = "exchange" altName={ _('change') } onClick = { showModal } />
                        )}
                    </div>
                </div>

                {_requiredConditions.sets.map((setData) => {
                    return renderSetItem(setData)
                })}
             </div>
        )
    }, [
        _requiredConditions
    ])
}
